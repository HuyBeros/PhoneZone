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
    bgImage: '/quinoa/iphone17.png',
    Image: '/quinoa/i1.png',
    title: 'iPhone 17 Pro', sub: 'Titanium Design · A19 Pro',
    desc: 'Camera 48MP thế hệ mới với cảm biến lớn hơn, chip A19 Pro vượt trội, pin cả ngày. Trải nghiệm iOS 19 đỉnh cao.',
    price: '34.999.000đ', oldPrice: '35.990.000đ', badge: '-8%',
    trust: ['Hàng chính hãng VNA', 'Trả góp 0%', 'Giao trong 2h'],
    buyLink: '/brand/all?q=iPhone+17+Pro',
    searchKeyword: 'iPhone 17 Pro',
  },
  {
    bgImage: '/quinoa/mi17.png',
    Image: '/quinoa/i2.png',
    title: 'Xiaomi 17 Pro Max', sub: 'Leica Summilux · HyperOS 2',
    desc: 'Camera Leica Summilux 50MP zoom quang học 5x, sạc 120W siêu tốc, Snapdragon 8 Elite. Màn hình OLED 120Hz cong tràn viền.',
    price: '22.650.000đ', oldPrice: '24.950.000đ', badge: '-11%',
    trust: ['Chính hãng DGW', 'Tặng tai nghe Xiaomi', 'BH 18 tháng'],
    buyLink: '/brand/all?q=Xiaomi+17+Pro+Max',
    searchKeyword: 'Xiaomi 17 Pro Max',
  },
  {
    bgImage: '/quinoa/vivo_x300_series_001.png',
    Image: '/quinoa/i3.png',
    title: 'vivo X300 Pro', sub: 'ZEISS Telephoto · 200W Flash',
    desc: 'Camera ZEISS 200MP telephoto chuyên nghiệp, sạc 200W nhanh nhất phân khúc, màn hình AMOLED 144Hz cực mượt.',
    price: '19.995.000đ', oldPrice: '21.990.000đ', badge: '-10%',
    trust: ['Chính hãng vivo VN', 'Tặng ốp lưng', 'BH 12 tháng'],
    buyLink: '/brand/all?q=vivo+X300+Pro',
    searchKeyword: 'vivo X300 Pro',
  }
];

function HeroSlider() {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCur(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const go = useCallback((n) => setCur((n + SLIDES.length) % SLIDES.length), []);

  return (
    <section className="hero" id="home">
      <div className="hero-slider">
        {SLIDES.map((s, i) => (
          <div key={i} className={`hero-slide${i === cur ? ' active' : ''}`} style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.92) 45%, rgba(255,255,255,0.3) 100%), url(${s.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            <div className="container hero-content">
              <div className="hero-text">
                <span className="hero-tag">{s.tag}</span>
                <h1 className="hero-title">{s.title}<br /><span className="gradient-text">{s.sub}</span></h1>
                <p className="hero-sub">{s.desc}</p>
                <div className="hero-price-wrap">
                  <span className="hero-price">{s.price}</span>
                  <span className="hero-price-old">{s.oldPrice}</span>
                  <span className="hero-discount">{s.badge}</span>
                </div>
                <div className="hero-btns">
                  <Link to={`/brand/all?q=${encodeURIComponent(s.searchKeyword)}`} className="btn btn-primary">Mua Ngay <i className="fas fa-arrow-right"></i></Link>
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
      <button className="slider-arrow prev" onClick={() => go(cur - 1)}><i className="fas fa-chevron-left"></i></button>
      <button className="slider-arrow next" onClick={() => go(cur + 1)}><i className="fas fa-chevron-right"></i></button>
      <div className="slider-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`dot${i === cur ? ' active' : ''}`} onClick={() => setCur(i)} />
        ))}
      </div>
    </section>
  );
}

/* ── Featured Products Slider ────────────────────────── */
function FeaturedSlider({ title, tag, products, linkTo, linkLabel }) {
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
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
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

        <div className="featured-slider-wrap">
          {canPrev && (
            <button className="featured-arrow featured-arrow-prev" onClick={() => scroll(-1)}>
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
            <button className="featured-arrow featured-arrow-next" onClick={() => scroll(1)}>
              <i className="fas fa-chevron-right"></i>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Why Us ──────────────────────────────────────────── */
function WhySection() {
  const items = [
    { icon: 'fa-certificate', title: '100% Chính Hãng', desc: 'Tất cả sản phẩm nhập khẩu chính hãng, có hóa đơn VAT, tem bảo hành hãng.' },
    { icon: 'fa-truck-fast', title: 'Giao Hàng 2 Giờ', desc: 'Giao nhanh trong 2 giờ nội thành Hà Nội & TP.HCM. Miễn phí từ 300K.' },
    { icon: 'fa-rotate-left', title: 'Đổi Trả 30 Ngày', desc: 'Không hài lòng? Đổi trả trong 30 ngày, hoàn tiền trong 24 giờ.' },
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

/* ── Newsletter ──────────────────────────────────────── */
function Newsletter() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();
  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Đăng ký thành công! Mã 500K đã gửi về email.', 'success');
    setEmail('');
  };
  return (
    <section className="newsletter-section" id="contact">
      <div className="container newsletter-inner">
        <div className="newsletter-text">
          <h2>Nhận Thông Báo <span className="highlight">Deal Hot</span></h2>
          <p>Đăng ký nhận ngay mã giảm 500K cho đơn hàng đầu tiên và cập nhật Flash Sale mỗi ngày.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="Nhập email của bạn..." required value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" className="btn btn-primary">Đăng Ký <i className="fas fa-paper-plane"></i></button>
        </form>
      </div>
    </section>
  );
}

/* ── HomePage ────────────────────────────────────────── */
export default function HomePage() {
  const [featuredPhones, setFeaturedPhones] = useState([]);
  const [featuredTablets, setFeaturedTablets] = useState([]);

  useEffect(() => {
    // Điện thoại nổi bật: lấy 1 sản phẩm cao cấp nhất của từng hãng
    fetchApi('/products?size=200&sort=price-desc')
      .then(res => {
        const data = res?.data || res || [];
        const mapped = (Array.isArray(data) ? data : []).map(mapProduct);

        // Chỉ lấy điện thoại
        const phones = mapped.filter(p => (p.brand || '').toLowerCase() !== 'máy tính bảng');

        // Lọc lấy 1 máy đắt nhất cho mỗi hãng
        const seenBrands = new Set();
        const topPerBrand = [];

        for (const p of phones) {
          const brand = (p.brand || 'Khác').toLowerCase();
          if (!seenBrands.has(brand)) {
            seenBrands.add(brand);
            topPerBrand.push(p);
            if (topPerBrand.length === 8) break; // Lấy tối đa 8 hãng
          }
        }

        setFeaturedPhones(topPerBrand);
      })
      .catch(err => console.error(err));

    // Máy tính bảng nổi bật: lấy 8 máy tính bảng giá cao nhất
    fetchApi('/products?brand=Máy tính bảng&size=8&sort=price-desc')
      .then(res => {
        const data = res?.data || res || [];
        setFeaturedTablets((Array.isArray(data) ? data : []).map(mapProduct).slice(0, 8));
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <HeroSlider />
      <FeaturedSlider
        tag="Sản phẩm cao cấp"
        title={<>Điện Thoại <span className="highlight">Nổi Bật</span></>}
        products={featuredPhones}
        linkTo="/brand/all"
        linkLabel="Xem tất cả điện thoại"
      />
      <FeaturedSlider
        tag="Máy tính bảng cao cấp"
        title={<>Máy Tính Bảng <span className="highlight">Nổi Bật</span></>}
        products={featuredTablets}
        linkTo="/tablet"
        linkLabel="Xem tất cả máy tính bảng"
      />
      <WhySection />
      <Newsletter />
    </>
  );
}
