"""
╔══════════════════════════════════════════════════════╗
║   Scraper điện thoại từ mobilecity.vn                ║
║   Bot học tập - HaUI Software Engineering            ║
╠══════════════════════════════════════════════════════╣
║  Cài đặt:                                            ║
║    pip install playwright                             ║
║    playwright install chromium                        ║
║  Chạy:                                               ║
║    python scrape_mobilecity.py                        ║
╚══════════════════════════════════════════════════════╝

Ghi chú:
  - robots.txt của mobilecity.vn: Allow: / → được phép cào
  - Mục đích: học tập, đồ án môn học, không thương mại
  - Có delay ngẫu nhiên giữa các request để không ảnh hưởng server
  - Khai báo rõ bot học tập qua User-Agent
"""

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from collections import Counter
from datetime import datetime
import json, csv, time, re, traceback, random

# ══════════════════════════════════════════════════════
# CẤU HÌNH
# ══════════════════════════════════════════════════════

CATEGORIES = [
    {"name": "Máy tính bảng",  "url": "https://mobilecity.vn/may-tinh-bang"},
]

# Bật/tắt cào thông số kỹ thuật chi tiết
SCRAPE_DETAIL = True

# Delay ngẫu nhiên (giây) — tránh ảnh hưởng server
DELAY_PAGES_MIN    = 3.0
DELAY_PAGES_MAX    = 6.0
DELAY_DETAIL_MIN   = 2.0
DELAY_DETAIL_MAX   = 4.0
DELAY_CATEGORY_MIN = 5.0
DELAY_CATEGORY_MAX = 10.0

PAGE_TIMEOUT = 45_000   # ms
RETRY_MAX    = 3
RETRY_WAIT   = 15.0     # giây chờ khi bị connection reset

# Khai báo rõ là bot học tập trong User-Agent
BOT_USER_AGENT = (
    "Mozilla/5.0 (compatible; StudyBot/1.0; "
    "+educational-project; HaUI-SoftwareEngineering) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

# ══════════════════════════════════════════════════════
# SCHEMA SẢN PHẨM
# ══════════════════════════════════════════════════════

PRODUCT_KEYS = [
    "ten_san_pham",
    "gia_ban", "gia_ban_so",
    "gia_goc", "gia_goc_so",
    "link", "hinh_anh",
    "danh_muc", "thoi_gian_cao",
    "thong_so",
]

def new_product(**kwargs) -> dict:
    base = {k: "" for k in PRODUCT_KEYS}
    base.update({
        "gia_ban_so":    0,
        "gia_goc_so":    0,
        "thoi_gian_cao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "thong_so":      {},
    })
    base.update(kwargs)
    return {k: base[k] for k in PRODUCT_KEYS}

# ══════════════════════════════════════════════════════
# TIỆN ÍCH
# ══════════════════════════════════════════════════════

def rand_delay(mn: float, mx: float):
    time.sleep(random.uniform(mn, mx))


def safe_text(el) -> str:
    try:
        return el.inner_text().strip() if el else ""
    except Exception:
        return ""


def parse_price_int(text: str) -> int:
    """'11.650.000 đ' → 11650000"""
    if not text:
        return 0
    first = text.split("\n")[0]
    digits = re.sub(r"[^\d]", "", first)
    return int(digits) if digits else 0


_PRICE_RE = re.compile(r"\d{1,3}(?:[.,]\d{3})+")

def fill_price(p: dict, ban_el, goc_el, box_el):
    """Điền gia_ban / gia_goc vào dict sản phẩm."""
    if ban_el:
        p["gia_ban"]    = safe_text(ban_el)
        p["gia_ban_so"] = parse_price_int(p["gia_ban"])
    if goc_el:
        p["gia_goc"]    = safe_text(goc_el)
        p["gia_goc_so"] = parse_price_int(p["gia_goc"])
    # Fallback: tách từ raw text nếu không tìm được selector cụ thể
    if not p["gia_ban"] and box_el:
        raw   = safe_text(box_el)
        lines = [l.strip() for l in raw.split("\n") if _PRICE_RE.search(l)]
        if lines:
            p["gia_ban"]    = lines[0]
            p["gia_ban_so"] = parse_price_int(lines[0])
        if len(lines) >= 2:
            goc = lines[1]
            goc_so = parse_price_int(goc)
            # Giá gốc phải lớn hơn giá bán
            if goc_so > p["gia_ban_so"]:
                p["gia_goc"]    = goc
                p["gia_goc_so"] = goc_so

# ══════════════════════════════════════════════════════
# PARSE Ô THÔNG SỐ (giữ đầy đủ từng dòng <br>)
#
# HTML thực tế:
#   <td>
#     50 MP, f/1.6 (góc rộng)<br>
#     50 MP, f/2.0, 60mm (tele)<br>
#     Quay phim: 8K@24fps...
#   </td>
#
# → Dùng inner_html() + tách <br> thay vì inner_text()
#   để không bị gộp thành 1 dòng
# ══════════════════════════════════════════════════════

def parse_cell(cell_el):
    """
    Trả về:
      str  — nếu chỉ có 1 dòng  (vd: "Android 15, HyperOS 2")
      list — nếu có nhiều dòng  (vd: Camera sau, CPU, Pin...)
    """
    try:
        html  = cell_el.inner_html()
        # Thay <br> thành ký tự xuống dòng
        html  = re.sub(r"<br\s*/?>", "\n", html, flags=re.IGNORECASE)
        # Xóa tất cả thẻ HTML còn lại
        text  = re.sub(r"<[^>]+>", "", html)
        # Decode HTML entities cơ bản
        text  = text.replace("&amp;", "&").replace("&lt;", "<") \
                    .replace("&gt;", ">").replace("&nbsp;", " ")
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        if not lines:
            return ""
        return lines[0] if len(lines) == 1 else lines
    except Exception:
        return safe_text(cell_el)


def parse_specs(page) -> dict:
    """
    Cào bảng thông số KỸ THUẬT ĐẦY ĐỦ từ div.product-lightbox-content.

    Cấu trúc HTML:
      div.product-lightbox-content
        table > tbody
          tr > td[colspan=2]  ← Nhóm (vd: "Màn hình", "CPU & RAM")  → bỏ qua
          tr > td[0] + td[1]  ← label + giá trị                      → lấy

    Kết quả mẫu:
      {
        "Màn hình": [
            "LTPO AMOLED, 68 tỷ màu, 120Hz, Dolby Vision",
            "6.36 inches, 1.5K (1200 x 2670 pixels)",
            "Tỷ lệ 20:9, mật độ điểm ảnh ~460 ppi",
            "Kính bảo vệ Shatterproof"
        ],
        "Hệ điều hành": "Android 15, HyperOS 2",
        "RAM": "12-16GB, LPDDR5X",
        ...
      }
    """
    specs = {}

    # Ưu tiên bảng chi tiết trong lightbox (đầy đủ hơn)
    rows = page.query_selector_all(
        "div.product-lightbox-content table tbody tr"
    )
    # Fallback về bảng tóm tắt nếu không có lightbox
    if not rows:
        rows = page.query_selector_all(
            "div.product-info-content table tbody tr"
        )

    for row in rows:
        try:
            cells = row.query_selector_all("td")

            # Bỏ dòng header colspan (vd: "Thông tin chung", "CPU & RAM")
            if len(cells) != 2:
                continue
            if cells[0].get_attribute("colspan") or cells[1].get_attribute("colspan"):
                continue

            label = safe_text(cells[0]).rstrip(":").strip()
            if not label:
                continue

            value = parse_cell(cells[1])
            if value or value == 0:
                # Nếu label đã tồn tại → gộp thêm (tránh mất data)
                if label in specs:
                    existing = specs[label]
                    if isinstance(existing, list):
                        if isinstance(value, list):
                            existing.extend(value)
                        else:
                            existing.append(value)
                    else:
                        specs[label] = [existing, value] if value != existing else existing
                else:
                    specs[label] = value

        except Exception:
            continue

    return specs

# ══════════════════════════════════════════════════════
# GOTO CÓ RETRY
# ══════════════════════════════════════════════════════

def goto_with_retry(page, url: str) -> bool:
    for attempt in range(1, RETRY_MAX + 1):
        try:
            page.goto(url, timeout=PAGE_TIMEOUT, wait_until="domcontentloaded")
            return True
        except PlaywrightTimeout:
            print(f"      ⏱️  Timeout lần {attempt}/{RETRY_MAX}")
        except Exception as e:
            err = str(e)
            if "ERR_CONNECTION_RESET" in err or "ERR_CONNECTION_REFUSED" in err:
                print(f"      🔄 Connection reset lần {attempt}/{RETRY_MAX} – chờ {RETRY_WAIT}s...")
                time.sleep(RETRY_WAIT)
            else:
                print(f"      ❌ Lỗi: {e}")
                return False
    return False

# ══════════════════════════════════════════════════════
# CÀO TRANG DANH SÁCH
# ══════════════════════════════════════════════════════

def scrape_listing_page(page) -> list:
    products = []
    try:
        page.wait_for_selector("div.product-list-item", timeout=10_000)
    except PlaywrightTimeout:
        return products

    # Scroll để lazy-load hết ảnh
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(1.5)

    for card in page.query_selector_all("div.product-list-item"):
        try:
            # ── Link ──
            link_el = card.query_selector("a")
            href    = link_el.get_attribute("href") if link_el else ""
            if href and not href.startswith("http"):
                href = "https://mobilecity.vn" + href
            if not href:
                continue

            # ── Tên (dòng đầu tiên của product-item-info) ──
            info_el = card.query_selector("div.product-item-info")
            name    = safe_text(info_el).split("\n")[0].strip()
            if not name:
                continue

            p = new_product(link=href, ten_san_pham=name)

            # ── Giá bán / Giá gốc ──
            ban_el = card.query_selector(
                "div.price-product p.price, "
                "div.price-product .price-current, "
                "div.price-product .price-sale"
            )
            goc_el = card.query_selector(
                "div.price-product p.price-old, "
                "div.price-product del, "
                "div.price-product s"
            )
            box_el = card.query_selector("div.price-product")
            fill_price(p, ban_el, goc_el, box_el)

            # ── Ảnh thumbnail ──
            img_el = card.query_selector("div.product-item-image img")
            if img_el:
                p["hinh_anh"] = (
                    img_el.get_attribute("src") or
                    img_el.get_attribute("data-src") or ""
                )

            products.append(p)
        except Exception:
            continue

    return products

# ══════════════════════════════════════════════════════
# CÀO TRANG CHI TIẾT
# ══════════════════════════════════════════════════════

def scrape_product_detail(page, url: str) -> dict:
    p = new_product(link=url)

    if not goto_with_retry(page, url):
        return p

    try:
        page.wait_for_selector("div.product-title h1.title", timeout=10_000)
    except PlaywrightTimeout:
        print(f"         ⚠️  Không load được: {url}")
        return p

    # ── Tên ──
    p["ten_san_pham"] = safe_text(page.query_selector("div.product-title h1.title"))

    # ── Giá ──
    ban_el = page.query_selector(
        "div.product-price-box .price-current, "
        "div.product-price-box p.price, "
        "div.product-price-box .price-sale"
    )
    goc_el = page.query_selector(
        "div.product-price-box .price-old, "
        "div.product-price-box del, "
        "div.product-price-box s"
    )
    box_el = page.query_selector("div.product-price-box")
    fill_price(p, ban_el, goc_el, box_el)

    # ── Ảnh chính (li đầu tiên / li.active) ──
    img_el = page.query_selector(
        "ul.product_image li.active img, "
        "ul.product_image li:first-child img"
    )
    if img_el:
        p["hinh_anh"] = (
            img_el.get_attribute("src") or
            img_el.get_attribute("data-src") or ""
        )

    # ── Thông số kỹ thuật đầy đủ ──
    # Lấy từ div.product-lightbox-content (bảng chi tiết đầy đủ)
    # thay vì div.product-info-content (bảng tóm tắt — thiếu nhiều)
    p["thong_so"] = parse_specs(page)

    return p

# ══════════════════════════════════════════════════════
# CÀO 1 DANH MỤC (có phân trang)
# ══════════════════════════════════════════════════════

def scrape_category(page, category: dict) -> list:
    all_products = []
    url      = category["url"]
    cat_name = category["name"]
    page_num = 1

    print(f"\n📱 [{cat_name}]")

    while True:
        current_url = url if page_num == 1 else f"{url}?page={page_num}"
        print(f"   Trang {page_num}: {current_url}")

        if not goto_with_retry(page, current_url):
            print(f"   ❌ Không vào được sau {RETRY_MAX} lần thử, bỏ qua.")
            break

        page_products = scrape_listing_page(page)
        if not page_products:
            print(f"   ℹ️  Không có sản phẩm, dừng danh mục.")
            break

        for p in page_products:
            p["danh_muc"]      = cat_name
            p["thoi_gian_cao"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if SCRAPE_DETAIL:
            for p in page_products:
                print(f"      → {p['ten_san_pham'][:65]}")
                try:
                    detail = scrape_product_detail(page, p["link"])
                    # Ghi đè bằng data chính xác hơn từ trang chi tiết
                    if detail["ten_san_pham"]:
                        p["ten_san_pham"] = detail["ten_san_pham"]
                    if detail["gia_ban"]:
                        p["gia_ban"]    = detail["gia_ban"]
                        p["gia_ban_so"] = detail["gia_ban_so"]
                    if detail["gia_goc"]:
                        p["gia_goc"]    = detail["gia_goc"]
                        p["gia_goc_so"] = detail["gia_goc_so"]
                    if detail["hinh_anh"]:
                        p["hinh_anh"]   = detail["hinh_anh"]
                    # Luôn dùng thông số từ trang chi tiết (đầy đủ hơn)
                    p["thong_so"] = detail["thong_so"]
                except Exception:
                    print(f"         ⚠️  Lỗi, bỏ qua sản phẩm này.")
                    traceback.print_exc()
                rand_delay(DELAY_DETAIL_MIN, DELAY_DETAIL_MAX)

        all_products.extend(page_products)
        print(f"   ✅ {len(page_products)} sản phẩm")

        # Kiểm tra trang tiếp theo
        next_btn = page.query_selector(
            "a.next, a[rel='next'], .pagination .next, li.next a"
        )
        if not next_btn:
            break

        page_num += 1
        rand_delay(DELAY_PAGES_MIN, DELAY_PAGES_MAX)

    print(f"   📦 Tổng: {len(all_products)} sản phẩm")
    return all_products

# ══════════════════════════════════════════════════════
# LƯU FILE
# ══════════════════════════════════════════════════════

def save_json(data: list, filename: str):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON: {filename}  ({len(data)} sản phẩm)")


def save_csv(data: list, filename: str):
    if not data:
        return
    rows = []
    for p in data:
        row   = {k: v for k, v in p.items() if k != "thong_so"}
        specs = p.get("thong_so", {})
        # Flatten: list → join bằng " / ", mỗi thông số cách nhau " | "
        row["thong_so"] = " | ".join(
            f"{k}: {v if isinstance(v, str) else ' / '.join(v)}"
            for k, v in specs.items()
        )
        rows.append(row)
    with open(filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=PRODUCT_KEYS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"💾 CSV:  {filename}  ({len(data)} sản phẩm)")

# ══════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════

def main():
    all_products = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,   # Đổi False để xem trình duyệt khi debug
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ],
        )

        context = browser.new_context(
            # Khai báo rõ: bot học tập, đồ án HaUI, không thương mại
            user_agent=BOT_USER_AGENT,
            viewport={"width": 1280, "height": 800},
            locale="vi-VN",
            timezone_id="Asia/Ho_Chi_Minh",
            java_script_enabled=True,
        )

        # Ẩn navigator.webdriver để tránh bị detect
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)

        page = context.new_page()
        # Chặn font để tải nhanh hơn, giữ ảnh vì cần URL
        page.route("**/*.{woff,woff2,ttf,otf}", lambda route: route.abort())

        print("=" * 60)
        print("🤖 Bot học tập - HaUI Software Engineering")
        print(f"🌐 Target        : mobilecity.vn")
        print(f"📋 Robots.txt    : Allow: / (được phép cào)")
        print(f"🎓 Mục đích      : Đồ án môn học, không thương mại")
        print("=" * 60)
        print(f"📦 Số danh mục   : {len(CATEGORIES)}")
        print(f"📷 Cào chi tiết  : {'Có — lấy thông số từ lightbox' if SCRAPE_DETAIL else 'Không'}")
        print(f"⏱️  Delay trang   : {DELAY_PAGES_MIN}-{DELAY_PAGES_MAX}s")
        print(f"⏱️  Delay chi tiết: {DELAY_DETAIL_MIN}-{DELAY_DETAIL_MAX}s")
        print(f"⏱️  Delay danh mục: {DELAY_CATEGORY_MIN}-{DELAY_CATEGORY_MAX}s")
        print("=" * 60)

        for i, category in enumerate(CATEGORIES):
            try:
                products = scrape_category(page, category)
                all_products.extend(products)
            except Exception:
                print(f"❌ Lỗi [{category['name']}]:")
                traceback.print_exc()

            if i < len(CATEGORIES) - 1:
                wait = random.uniform(DELAY_CATEGORY_MIN, DELAY_CATEGORY_MAX)
                print(f"\n   😴 Nghỉ {wait:.1f}s trước danh mục tiếp theo...")
                time.sleep(wait)

        browser.close()

    # Loại bỏ trùng theo link
    seen, unique = set(), []
    for p in all_products:
        if p["link"] not in seen:
            seen.add(p["link"])
            unique.append(p)

    print("\n" + "=" * 60)
    print(f"🎉 HOÀN THÀNH! Tổng: {len(unique)} sản phẩm (đã dedup)")

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    save_json(unique, f"mobilecity_{ts}.json")
    save_csv(unique,  f"mobilecity_{ts}.csv")

    # Thống kê
    print("\n📊 Thống kê theo danh mục:")
    counts = Counter(p["danh_muc"] for p in unique)
    for cat, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"   {cat:<25} {count:>4} sản phẩm")

    # Kiểm tra mẫu thông số
    print("\n🔍 Kiểm tra mẫu thông số (sản phẩm đầu tiên):")
    if unique:
        p = unique[0]
        print(f"   Sản phẩm : {p['ten_san_pham']}")
        print(f"   Giá bán  : {p['gia_ban']}")
        print(f"   Giá gốc  : {p['gia_goc'] or '(không có)'}")
        print(f"   Thông số ({len(p['thong_so'])} mục):")
        for k, v in p["thong_so"].items():
            if isinstance(v, list):
                print(f"     {k}:")
                for line in v:
                    print(f"       - {line}")
            else:
                print(f"     {k}: {v}")


if __name__ == "__main__":
    main()