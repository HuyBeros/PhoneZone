import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BRANDS } from '../data/data';
import { fmt, discount, mapProduct } from '../utils/utils';
import ProductCard from '../components/ProductCard';
import { fetchApi } from '../api/apiClient';
import { useToast } from '../store/ToastContext';

/* ── Hero Slider ─────────────────────────────────────── */
const SLIDES = [
  {
    bgImage: '/iphone17.png',
    Image: '/i1.png',
    tag: 'MỚI RA MẮT',
    title: 'iPhone 17 Pro',
    sub: 'Titanium Design · Chip A19 Pro',
    desc: 'Cảm biến 48MP Fusion thế hệ mới, khung viền Titanium siêu bền, thời lượng pin cả ngày dài và trải nghiệm Apple Intelligence đỉnh cao.',
    price: '34.990.000đ',
    oldPrice: '37.990.000đ',
    badge: '-8%',
    trust: ['Hàng chính hãng VN/A', 'Trả góp 0% lãi suất', 'Bảo hành 1 đổi 1 trong 30 ngày'],
    buyLink: '/brand/all?q=iPhone+17+Pro',
    searchKeyword: 'iPhone 17 Pro',
  },
  {
    bgImage: '/mi17.png',
    Image: '/i2.png',
    tag: 'FLAGSHIP 2026',
    title: 'Xiaomi 17 Pro Max',
    sub: 'Camera Leica Summilux · Sạc Siêu Tốc 120W',
    desc: 'Cụm 3 camera Leica 50MP quang học zoom 5x, vi xử lý Snapdragon 8 Elite mạnh mẽ và màn hình OLED 144Hz cong tràn viền sắc nét.',
    price: '22.650.000đ',
    oldPrice: '24.950.000đ',
    badge: '-11%',
    trust: ['Chính hãng Digiworld', 'Tặng củ sạc nhanh 120W', 'Bảo hành 18 tháng chính hãng'],
    buyLink: '/brand/all?q=Xiaomi+17+Pro+Max',
    searchKeyword: 'Xiaomi 17 Pro Max',
  },
  {
    bgImage: '/vivo_x300_series_001.png',
    Image: '/i3.png',
    tag: 'CHUYÊN GIA NHIẾP ẢNH',
    title: 'vivo X300 Pro',
    sub: 'Ống Kính ZEISS T* · Pin Khủng 6000mAh',
    desc: 'Camera ZEISS 200MP telephoto chuyên nghiệp, chống rung gimbal chuẩn điện ảnh, sạc nhanh 200W và màn hình AMOLED 1.5K cực mượt.',
    price: '19.990.000đ',
    oldPrice: '21.990.000đ',
    badge: '-10%',
    trust: ['Chính hãng vivo Việt Nam', 'Tặng gói bảo hành rơi vỡ', 'Giao siêu tốc 2 giờ'],
    buyLink: '/brand/all?q=vivo+X300+Pro',
    searchKeyword: 'vivo X300 Pro',
  }
];

function HeroSlider() {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCur(c => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const go = useCallback((n) => setCur((n + SLIDES.length) % SLIDES.length), []);

  return (
    <section className="hero" id="home">
      <div className="hero-slider">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`hero-slide${i === cur ? ' active' : ''}`}
            aria-hidden={i !== cur}
            inert={i !== cur ? '' : undefined}
            style={{
              '--hero-background': `url(${s.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="container hero-content">
              <div className="hero-text">
                <span className="hero-tag">
                  <i className="fas fa-sparkles"></i> {s.tag}
                </span>
                <h1 className="hero-title">
                  {s.title}
                  <span className="gradient-text hero-title-sub">{s.sub}</span>
                </h1>
                <p className="hero-sub">{s.desc}</p>
                <div className="hero-price-wrap">
                  <span className="hero-price">{s.price}</span>
                  <span className="hero-price-old">{s.oldPrice}</span>
                  <span className="hero-discount">{s.badge}</span>
                </div>
                <div className="hero-btns">
                  <Link to={`/brand/all?q=${encodeURIComponent(s.searchKeyword)}`} className="btn btn-primary">
                    Mua Ngay <i className="fas fa-arrow-right"></i>
                  </Link>
                  <Link to={`/brand/all?q=${encodeURIComponent(s.searchKeyword)}`} className="btn btn-hero-secondary">
                    Xem chi tiết
                  </Link>
                </div>
                <div className="hero-trust">
                  {s.trust.map(t => (
                    <span key={t}><i className="fas fa-circle-check"></i> {t}</span>
                  ))}
                </div>
              </div>
              <div className="hero-image">
                <div className="hero-img-wrap">
                  <img src={s.Image} alt={s.title} className="float-img" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="slider-arrow prev" aria-label="Slide trước" onClick={() => go(cur - 1)}>
        <i className="fas fa-chevron-left"></i>
      </button>
      <button className="slider-arrow next" aria-label="Slide tiếp theo" onClick={() => go(cur + 1)}>
        <i className="fas fa-chevron-right"></i>
      </button>
      <div className="slider-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`dot${i === cur ? ' active' : ''}`}
            aria-label={`Đi tới slide ${i + 1}`}
            onClick={() => setCur(i)}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Quick Brand Navigation Bar ──────────────────────── */
function QuickBrandsBar() {
  const quickList = [
    { id: 'iphone', name: 'iPhone', img: '/brands/apple.svg', link: '/brand/iphone' },
    { id: 'samsung', name: 'Samsung', img: '/brands/samsung.svg', link: '/brand/samsung' },
    { id: 'xiaomi', name: 'Xiaomi', img: '/brands/xiaomi.svg', link: '/brand/xiaomi' },
    { id: 'oppo', name: 'OPPO', img: '/brands/oppo.svg', link: '/brand/oppo' },
    { id: 'vivo', name: 'vivo', img: '/brands/vivo.svg', link: '/brand/vivo' },
    { id: 'realme', name: 'Realme', img: '/brands/realme.svg', link: '/brand/realme' },
    { id: 'tablet', name: 'Máy Tính Bảng', img: '/brands/tablet.svg', link: '/tablet' },
    { id: 'repair', name: 'Sửa Chữa', img: '/brands/repair.svg', link: '/repair' },
  ];

  return (
    <section className="quick-brands-section">
      <div className="container">
        <div className="quick-brands-grid">
          {quickList.map(item => (
            <Link key={item.id} to={item.link} className="quick-brand-item">
              <div className="qb-icon-wrap">
                <img src={item.img} alt={item.name} />
              </div>
              <span className="qb-name">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Flash Sale Section with Countdown ────────────────── */
function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 35, seconds: 28 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flash-countdown">
      <span className="fc-label"><i className="fas fa-clock"></i> Kết thúc trong:</span>
      <div className="fc-digits">
        <span className="fc-box">{pad(timeLeft.hours)}</span>
        <span className="fc-colon">:</span>
        <span className="fc-box">{pad(timeLeft.minutes)}</span>
        <span className="fc-colon">:</span>
        <span className="fc-box">{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}

function FlashSaleSection({ products }) {
  const scrollRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Lấy các sản phẩm có giảm giá
  const saleProducts = products
    .filter(p => p.oldPrice && p.oldPrice > p.price)
    .slice(0, 10);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const timer = setTimeout(checkScroll, 100);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      clearTimeout(timer);
    };
  }, [saleProducts]);

  if (saleProducts.length === 0) return null;

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className="flash-sale-section">
      <div className="container">
        <div className="flash-sale-wrapper">
          <div className="flash-sale-header">
            <div className="flash-sale-title-group">
              <span className="flash-flame-icon"><i className="fas fa-fire-flame-curved"></i></span>
              <div>
                <h2 className="flash-title">FLASH SALE GIÁ SỐC</h2>
                <p className="flash-subtitle">Ưu đãi giảm giá có hạn – Săn ngay kẻo lỡ!</p>
              </div>
            </div>
            <FlashSaleCountdown />
          </div>

          <div className="featured-slider-wrap">
            {canPrev && (
              <button className="featured-arrow featured-arrow-prev" onClick={() => scroll(-1)} aria-label="Trước">
                <i className="fas fa-chevron-left"></i>
              </button>
            )}
            <div className="featured-slider" ref={scrollRef}>
              {saleProducts.map(p => (
                <div key={p.id} className="featured-slide-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            {canNext && (
              <button className="featured-arrow featured-arrow-next" onClick={() => scroll(1)} aria-label="Sau">
                <i className="fas fa-chevron-right"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Featured Products Slider ────────────────────────── */
function FeaturedSlider({ title, tag, products, linkTo, linkLabel, children }) {
  const scrollRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const timer = setTimeout(checkScroll, 100);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      clearTimeout(timer);
    };
  }, [products]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className="featured-section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-tag">{tag}</span>
            <h2 className="section-title">{title}</h2>
          </div>
          <Link to={linkTo} className="btn btn-outline btn-sm">
            {linkLabel} <i className="fas fa-chevron-right"></i>
          </Link>
        </div>

        {children}

        <div className="featured-slider-wrap">
          {canPrev && (
            <button className="featured-arrow featured-arrow-prev" onClick={() => scroll(-1)} aria-label="Trước">
              <i className="fas fa-chevron-left"></i>
            </button>
          )}
          <div className="featured-slider" ref={scrollRef}>
            {products.map(p => (
              <div className="featured-slide-item" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          {canNext && (
            <button className="featured-arrow featured-arrow-next" onClick={() => scroll(1)} aria-label="Sau">
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Section Why Us ──────────────────────────────────── */
function WhySection() {
  const items = [
    {
      icon: 'fa-shield-halved',
      title: '100% Hàng Chính Hãng',
      desc: 'Nhập khẩu trực tiếp từ Apple, Samsung, Xiaomi, OPPO... Đầy đủ hóa đơn VAT, chứng từ và bảo hành toàn quốc.'
    },
    {
      icon: 'fa-truck-fast',
      title: 'Giao Nhanh Toàn Quốc',
      desc: 'Giao hỏa tốc 2 giờ nội thành Hà Nội & TP.HCM. Kiểm tra hàng trước khi thanh toán.'
    },
    {
      icon: 'fa-arrows-rotate',
      title: 'Lỗi 1 Đổi 1 Trong 30 Ngày',
      desc: 'Yên tâm sử dụng với chính sách đổi mới ngay lập tức nếu thiết bị gặp lỗi phần cứng từ nhà sản xuất.'
    },
    {
      icon: 'fa-hand-holding-dollar',
      title: 'Trả Góp 0% Lãi Suất',
      desc: 'Hỗ trợ trả góp 0% qua thẻ tín dụng và công ty tài chính với thủ tục xét duyệt online chỉ mất 5 phút.'
    },
  ];

  return (
    <section className="why-section">
      <div className="container">
        <div className="why-grid">
          {items.map(it => (
            <div key={it.title} className="why-card">
              <div className="why-icon"><i className={`fas ${it.icon}`}></i></div>
              <h3>{it.title}</h3>
              <p>{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Customer Testimonials ────────────────────────────── */
function CustomerReviewsSection() {
  const reviews = [
    {
      name: 'Nguyễn Thành Nam',
      product: 'iPhone 17 Pro Max 256GB Titanium',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      comment: 'Máy nguyên seal chính hãng VN/A, bảo hành đầy đủ tại Apple Care. Nhân viên hỗ trợ chuyển dữ liệu và dán cường lực rất nhiệt tình.',
      stars: 5,
      date: 'Vừa xong'
    },
    {
      name: 'Lê Hoàng Yến',
      product: 'Xiaomi 17 Pro Max Leica',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      comment: 'Camera Leica chụp chân dung xóa phông cực kỳ nghệ thuật. Sạc 120W 20 phút đầy pin, nhân viên giao máy sau 1 giờ đặt hàng.',
      stars: 5,
      date: 'Hôm qua'
    },
    {
      name: 'Trần Minh Quân',
      product: 'Samsung Galaxy Tab S10 Ultra',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      comment: 'Màn hình OLED 120Hz viết vẽ cực nhạy. Giá tại PhoneZone tốt hơn thị trường đáng kể, thủ tục trả góp 0% nhanh gọn.',
      stars: 5,
      date: '3 ngày trước'
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header text-center">
          <div>
            <span className="section-tag">TRẢI NGHIỆM KHÁCH HÀNG</span>
            <h2 className="section-title">Khách Hàng <span className="highlight">Tin Chọn PhoneZone</span></h2>
          </div>
        </div>
        <div className="testimonials-grid">
          {reviews.map((r, i) => (
            <div key={i} className="testimonial-card">
              <div className="tc-header">
                <img src={r.avatar} alt={r.name} className="tc-avatar" />
                <div>
                  <h4 className="tc-name">{r.name}</h4>
                  <p className="tc-product">
                    <i className="fas fa-circle-check"></i> {r.product}
                  </p>
                </div>
              </div>
              <div className="tc-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <i key={s} className="fas fa-star"></i>
                ))}
                <span className="tc-date">{r.date}</span>
              </div>
              <p className="tc-comment">"{r.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Newsletter ──────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Đăng ký thành công! Mã voucher 500K đã gửi về email của bạn.', 'success');
    setEmail('');
  };

  return (
    <section className="newsletter-section" id="contact">
      <div className="container newsletter-inner">
        <div className="newsletter-text">
          <h2>Nhận Thông Báo <span className="highlight">Deal Hot &amp; Voucher 500K</span></h2>
          <p>
            Đăng ký nhận ngay voucher 500K cho đơn hàng đầu tiên và không bỏ lỡ đợt Flash Sale smartphone &amp; tablet giá sốc.
          </p>
          <span className="newsletter-privacy">
            <i className="fas fa-lock"></i> Chúng tôi cam kết bảo mật 100% email của bạn và không gửi spam.
          </span>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Nhập địa chỉ email của bạn..."
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Đăng Ký <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </section>
  );
}

/* ── Main HomePage ────────────────────────────────────── */
export default function HomePage() {
  const [allPhones, setAllPhones] = useState([]);
  const [featuredPhones, setFeaturedPhones] = useState([]);
  const [featuredTablets, setFeaturedTablets] = useState([]);
  const [selectedBrandTab, setSelectedBrandTab] = useState('all');

  useEffect(() => {
    // 1. Điện thoại nổi bật
    fetchApi('/products?size=200&sort=price-desc')
      .then(res => {
        const data = res?.data || res || [];
        const mapped = (Array.isArray(data) ? data : []).map(mapProduct);

        const phones = mapped.filter(p => {
          const brand = (p.brand || '').toLowerCase();
          return !brand.includes('máy tính bảng') && !brand.includes('tablet');
        });

        setAllPhones(phones);

        // Lấy 1 máy cao cấp nhất cho mỗi hãng để làm nổi bật
        const seenBrands = new Set();
        const topPerBrand = [];
        for (const p of phones) {
          const brand = (p.brand || 'Khác').toLowerCase();
          if (!seenBrands.has(brand)) {
            seenBrands.add(brand);
            topPerBrand.push(p);
            if (topPerBrand.length === 10) break;
          }
        }
        setFeaturedPhones(topPerBrand);
      })
      .catch(err => console.error(err));

    // 2. Máy tính bảng nổi bật
    fetchApi(`/products?brand=${encodeURIComponent('Máy tính bảng')}&size=8&sort=price-desc`)
      .then(res => {
        const data = res?.data || res || [];
        setFeaturedTablets((Array.isArray(data) ? data : []).map(mapProduct).slice(0, 8));
      })
      .catch(err => console.error(err));
  }, []);

  // Lọc điện thoại theo tab thương hiệu
  const displayPhones = selectedBrandTab === 'all'
    ? featuredPhones
    : allPhones.filter(p => (p.brand || '').toLowerCase().includes(selectedBrandTab.toLowerCase())).slice(0, 8);

  const brandTabs = [
    { id: 'all', label: 'Tất Cả Flagship' },
    { id: 'iphone', label: 'iPhone' },
    { id: 'samsung', label: 'Samsung' },
    { id: 'xiaomi', label: 'Xiaomi' },
    { id: 'oppo', label: 'OPPO' },
    { id: 'vivo', label: 'vivo' },
  ];

  return (
    <>
      {/* 1. Hero Slider Banner */}
      <HeroSlider />

      {/* 2. Quick Brand Navigation Bar */}
      <QuickBrandsBar />

      {/* 3. Flash Sale Section có Countdown (Đồng bộ tỉ lệ card) */}
      <FlashSaleSection products={allPhones.length > 0 ? allPhones : featuredPhones} />

      {/* 4. Điện Thoại Nổi Bật có Brand Tabs */}
      <FeaturedSlider
        tag="SẢN PHẨM CAO CẤP"
        title={<>Điện Thoại <span className="highlight">Nổi Bật</span></>}
        products={displayPhones.length > 0 ? displayPhones : featuredPhones}
        linkTo="/brand/all"
        linkLabel="Xem tất cả điện thoại"
      >
        <div className="home-brand-tabs">
          {brandTabs.map(t => (
            <button
              key={t.id}
              className={`home-brand-tab${selectedBrandTab === t.id ? ' active' : ''}`}
              onClick={() => setSelectedBrandTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FeaturedSlider>

      {/* 5. Máy Tính Bảng Nổi Bật */}
      <FeaturedSlider
        tag="MÁY TÍNH BẢNG CAO CẤP"
        title={<>Máy Tính Bảng <span className="highlight">Nổi Bật</span></>}
        products={featuredTablets}
        linkTo="/tablet"
        linkLabel="Xem tất cả máy tính bảng"
      />

      {/* 6. Khối Cam Kết Tại Sao Chọn PhoneZone */}
      <WhySection />

      {/* 7. Trải Nghiệm Khách Hàng */}
      <CustomerReviewsSection />

      {/* 8. Đăng Ký Email Nhận Deal */}
      <Newsletter />
    </>
  );
}
