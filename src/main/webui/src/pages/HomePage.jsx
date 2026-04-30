import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BRANDS, PHONES, ACCESSORIES } from '../data/data';
import { fmt, discount } from '../utils/utils';
import ProductCard from '../components/ProductCard';

/* ── Hero Slider ─────────────────────────────────────── */
const SLIDES = [
  {
    bg: 'linear-gradient(135deg,#dbeafe 0%,#eff6ff 50%,#e0f2fe 100%)',
    tag: '📱 Ra mắt 2025', title: 'iPhone 16 Pro Max', sub: 'Titanium Design',
    desc: 'Camera 48MP thế hệ mới, chip A18 Pro siêu mạnh, pin 29 giờ. Trải nghiệm iOS 18 đỉnh cao.',
    price: '34.990.000đ', oldPrice: '37.990.000đ', badge: '-8%',
    trust: ['Hàng chính hãng VNA', 'Trả góp 0%', 'Giao trong 2h'],
  },
  {
    bg: 'linear-gradient(135deg,#e0f2fe 0%,#dbeafe 50%,#ede9fe 100%)',
    tag: '🇰🇷 Samsung Flagship', title: 'Galaxy S25 Ultra', sub: 'AI Phone 2025',
    desc: 'Bút S Pen tích hợp AI, camera 200MP, Snapdragon 8 Elite. Điện thoại Android mạnh nhất 2025.',
    price: '29.990.000đ', oldPrice: '32.990.000đ', badge: '-9%',
    trust: ['Chính hãng Samsung VN', 'Tặng ốp lưng', 'BH 12 tháng'],
  },
  {
    bg: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#dbeafe 100%)',
    tag: '🇨🇳 Xiaomi 15 Ultra', title: 'Xiaomi 15 Ultra', sub: 'Leica Camera Pro',
    desc: 'Camera Leica 50MP 5x optical zoom, sạc 90W siêu nhanh, màn hình OLED 120Hz cong.',
    price: '23.990.000đ', oldPrice: '26.990.000đ', badge: '-11%',
    trust: ['Chính hãng DGW', 'Tặng tai nghe', 'BH 18 tháng'],
  },
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
          <div key={i} className={`hero-slide${i === cur ? ' active' : ''}`} style={{ background: s.bg }}>
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
                  <Link to="/brand/all" className="btn btn-primary">Mua Ngay <i className="fa fa-arrow-right"></i></Link>
                  <Link to="/brand/all" className="btn btn-outline">Xem cấu hình</Link>
                </div>
                <div className="hero-trust">
                  {s.trust.map(t => (
                    <span key={t}><i className="fa fa-check-circle"></i> {t}</span>
                  ))}
                </div>
              </div>
              <div className="hero-image">
                <div className="hero-img-wrap">
                  <img src="/quinoa/product_phone.png" alt={s.title} className="float-img" />
                  {i === 0 && <div className="hero-badge-chip">🔒 Bảo mật Face ID</div>}
                  {i === 0 && <div className="hero-badge-rating">⭐ 4.9 · 8,234 đánh giá</div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="slider-arrow prev" onClick={() => go(cur - 1)}><i className="fa fa-chevron-left"></i></button>
      <button className="slider-arrow next" onClick={() => go(cur + 1)}><i className="fa fa-chevron-right"></i></button>
      <div className="slider-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`dot${i === cur ? ' active' : ''}`} onClick={() => setCur(i)} />
        ))}
      </div>
    </section>
  );
}


/* ── Brands Section ──────────────────────────────────── */
function BrandsSection({ activeBrand, onChange }) {
  const list = activeBrand === 'all' ? PHONES : PHONES.filter(p => p.brand === activeBrand);
  return (
    <section className="brands-section" id="phones">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-tag">Danh mục theo hãng</span>
            <h2 className="section-title">Điện thoại <span className="highlight">Chính Hãng</span></h2>
          </div>
        </div>
        <div className="brand-tabs">
          <button className={`brand-tab${activeBrand === 'all' ? ' active' : ''}`} onClick={() => onChange('all')}>Tất cả</button>
          {BRANDS.map(b => (
            <button key={b.id} className={`brand-tab${activeBrand === b.id ? ' active' : ''}`} onClick={() => onChange(b.id)}>
              {b.emoji} {b.name}
            </button>
          ))}
        </div>
        <div className="products-grid">
          {list.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="load-more-wrap">
          <Link to={`/brand/${activeBrand}`} className="btn btn-outline">
            Xem tất cả {activeBrand !== 'all' ? BRANDS.find(b => b.id === activeBrand)?.name : ''} <i className="fa fa-chevron-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Accessory Section ───────────────────────────────── */
function AccessorySection() {
  const cats = [
    { id: 'earbuds',    label: 'Tai nghe',            img: '/quinoa/product_earbuds.png' },
    { id: 'speaker',    label: 'Loa Bluetooth',        img: '/quinoa/product_speaker.png' },
    { id: 'watch',      label: 'Đồng hồ thông minh',  img: '/quinoa/product_smartwatch.png' },
    { id: 'headphones', label: 'Tai nghe chụp tai',   img: '/quinoa/product_headphones.png' },
  ];
  return (
    <section className="accessory-section" id="accessory">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="section-tag">Phụ kiện điện thoại</span>
            <h2 className="section-title">Phụ Kiện <span className="highlight">Chính Hãng</span></h2>
          </div>
        </div>
        <div className="accessory-cats">
          {cats.map(c => (
            <a key={c.id} href="#" className="acc-cat-card">
              <img src={c.img} alt={c.label} />
              <span>{c.label}</span>
            </a>
          ))}
        </div>
        <div className="products-grid">
          {ACCESSORIES.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Why Us ──────────────────────────────────────────── */
function WhySection() {
  const items = [
    { icon: 'fa-certificate', title: '100% Chính Hãng', desc: 'Tất cả sản phẩm nhập khẩu chính hãng, có hóa đơn VAT, tem bảo hành hãng.' },
    { icon: 'fa-shipping-fast', title: 'Giao Hàng 2 Giờ', desc: 'Giao nhanh trong 2 giờ nội thành Hà Nội & TP.HCM. Miễn phí từ 300K.' },
    { icon: 'fa-credit-card', title: 'Trả Góp 0%', desc: 'Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng và dịch vụ MPOS.' },
    { icon: 'fa-undo-alt', title: 'Đổi Trả 30 Ngày', desc: 'Không hài lòng? Đổi trả trong 30 ngày, hoàn tiền trong 24 giờ.' },
  ];
  return (
    <section className="why-section">
      <div className="container">
        <div className="why-grid">
          {items.map(it => (
            <div key={it.title} className="why-card">
              <div className="why-icon"><i className={`fa ${it.icon}`}></i></div>
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
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('🎉 Đăng ký thành công! Mã 500K đã gửi về email.');
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
          <button type="submit" className="btn btn-primary">Đăng Ký <i className="fa fa-paper-plane"></i></button>
        </form>
      </div>
    </section>
  );
}

/* ── HomePage ────────────────────────────────────────── */
export default function HomePage() {
  const [activeBrand, setActiveBrand] = useState('all');

  return (
    <>
      <HeroSlider />
      <BrandsSection activeBrand={activeBrand} onChange={setActiveBrand} />
      <AccessorySection />
      <WhySection />
      <Newsletter />
    </>
  );
}
