"""
╔══════════════════════════════════════════════════════╗
║   Scraper dịch vụ sửa chữa từ mobilecity.vn          ║
║   Bot học tập - HaUI Software Engineering            ║
╠══════════════════════════════════════════════════════╣
║  Cài đặt:                                            ║
║    pip install playwright                             ║
║    playwright install chromium                        ║
║  Chạy:                                               ║
║    python scrape_repair.py                            ║
╚══════════════════════════════════════════════════════╝
"""

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from datetime import datetime
import json, csv, time, re

# ══════════════════════════════════════════════════════
# CẤU HÌNH
# ══════════════════════════════════════════════════════

TARGET_URL = "https://mobilecity.vn/sua-chua-dien-thoai"
LIMIT      = 10   # Số dịch vụ muốn lấy

BOT_USER_AGENT = (
    "Mozilla/5.0 (compatible; StudyBot/1.0; "
    "+educational-project; HaUI-SoftwareEngineering) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

# ══════════════════════════════════════════════════════
# TIỆN ÍCH
# ══════════════════════════════════════════════════════

def safe_text(el) -> str:
    try:
        return el.inner_text().strip() if el else ""
    except Exception:
        return ""

def parse_price_int(text: str) -> int:
    if not text:
        return 0
    digits = re.sub(r"[^\d]", "", text.split("\n")[0])
    return int(digits) if digits else 0

# ══════════════════════════════════════════════════════
# CÀO DANH SÁCH DỊCH VỤ
#
# Cấu trúc HTML thực tế:
#   div.service-item-left
#     p.name > a[href, title]   ← tên + link
#     p.price                   ← giá
# ══════════════════════════════════════════════════════

def scrape_repair_list(page) -> list:
    services = []

    print(f"\n🔧 Đang tải: {TARGET_URL}")
    page.goto(TARGET_URL, timeout=45_000, wait_until="domcontentloaded")

    # Scroll để load hết lazy content
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)

    try:
        page.wait_for_selector("div.service-item-left", timeout=10_000)
    except PlaywrightTimeout:
        print("   ❌ Không tìm thấy div.service-item-left")
        return services

    cards = page.query_selector_all("div.service-item-left")
    print(f"   ✅ Tìm thấy {len(cards)} dịch vụ, lấy {min(LIMIT, len(cards))} dịch vụ đầu")

    for card in cards[:LIMIT]:
        try:
            # ── Tên + Link từ p.name > a ──
            a_el   = card.query_selector("p.name a")
            name   = a_el.get_attribute("title") or safe_text(a_el) if a_el else ""
            href   = a_el.get_attribute("href") or "" if a_el else ""
            if href and not href.startswith("http"):
                href = "https://mobilecity.vn" + href

            # ── Giá từ p.price ──
            price_el   = card.query_selector("p.price")
            price_text = safe_text(price_el)

            if name:
                services.append({
                    "ten_dich_vu":   name,
                    "gia_hien_thi":  price_text,
                    "gia_so":        parse_price_int(price_text),
                    "link":          href,
                    "thoi_gian_cao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                })

        except Exception as e:
            print(f"   ⚠️  Lỗi: {e}")
            continue

    return services

# ══════════════════════════════════════════════════════
# LƯU FILE
# ══════════════════════════════════════════════════════

def save_json(data: list, filename: str):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON: {filename}  ({len(data)} dịch vụ)")

def save_csv(data: list, filename: str):
    if not data:
        return
    with open(filename, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"💾 CSV:  {filename}  ({len(data)} dịch vụ)")

# ══════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════

def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = browser.new_context(
            user_agent=BOT_USER_AGENT,
            viewport={"width": 1280, "height": 800},
            locale="vi-VN",
            timezone_id="Asia/Ho_Chi_Minh",
        )
        context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        """)

        page = context.new_page()
        page.route("**/*.{woff,woff2,ttf,otf}", lambda route: route.abort())

        print("=" * 55)
        print("🤖 Bot học tập - HaUI Software Engineering")
        print(f"🌐 Target : {TARGET_URL}")
        print(f"📦 Giới hạn: {LIMIT} dịch vụ")
        print("=" * 55)

        services = scrape_repair_list(page)
        browser.close()

    print("\n" + "=" * 55)
    print(f"🎉 HOÀN THÀNH! {len(services)} dịch vụ")

    # In kết quả ra màn hình
    print("\n📊 Kết quả:")
    for i, svc in enumerate(services):
        print(f"   [{i+1}] {svc['ten_dich_vu']}")
        print(f"        Giá : {svc['gia_hien_thi'] or '(chưa có)'}")
        print(f"        Link: {svc['link']}")

    # Lưu file
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    save_json(services, f"repair_services_{ts}.json")
    save_csv(services,  f"repair_services_{ts}.csv")


if __name__ == "__main__":
    main()