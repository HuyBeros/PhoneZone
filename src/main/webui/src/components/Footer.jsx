import { Link } from 'react-router-dom';
import { BRANDS } from '../data/data';
import {
  IoPhonePortraitOutline,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoYoutube,
  IoLogoTiktok,
  IoChevronForward,
  IoLocationOutline,
  IoCallOutline,
  IoHeadsetOutline,
  IoMailOutline,
  IoTimeOutline,
} from 'react-icons/io5';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Cột 1: Thương hiệu */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <IoPhonePortraitOutline style={{ marginRight: 6, verticalAlign: '-2px' }} />PhoneZone
          </Link>
          <p className="footer-desc">
            Hệ thống bán lẻ điện thoại &amp; máy tính bảng chính hãng hàng đầu Việt Nam. Cam kết chất lượng, bảo hành uy tín và giá cả cạnh tranh.
          </p>

          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <IoLogoFacebook style={{ fontSize: '1.15rem' }} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IoLogoInstagram style={{ fontSize: '1.15rem' }} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <IoLogoYoutube style={{ fontSize: '1.15rem' }} />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <IoLogoTiktok style={{ fontSize: '1.15rem' }} />
            </a>
          </div>
        </div>
        
        {/* Cột 2: Điện thoại theo hãng */}
        <div className="footer-col">
          <h4>Điện thoại theo hãng</h4>
          <ul>
            {BRANDS.slice(0, 6).map(b => (
              <li key={b.id}>
                <Link to={`/brand/${b.id}`}>
                  <IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.7, verticalAlign: '-1px', marginRight: 4 }} /> {b.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/brand/all" className="footer-link-highlight">
                <IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.7, verticalAlign: '-1px', marginRight: 4 }} /> Xem tất cả hãng &rarr;
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Cột 3: Hỗ trợ & Chính sách */}
        <div className="footer-col">
          <h4>Hỗ trợ &amp; Chính sách</h4>
          <ul>
            <li><a href="#"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.7, verticalAlign: '-1px', marginRight: 4 }} /> Chính sách bảo hành chính hãng</a></li>
            <li><a href="#"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.7, verticalAlign: '-1px', marginRight: 4 }} /> Hướng dẫn mua trả góp 0%</a></li>
            <li><Link to="/orders"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.7, verticalAlign: '-1px', marginRight: 4 }} /> Tra cứu đơn hàng</Link></li>
            <li><a href="#"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.7, verticalAlign: '-1px', marginRight: 4 }} /> Chính sách đổi trả trong 30 ngày</a></li>
            <li><a href="#"><IoChevronForward style={{ fontSize: '0.8rem', opacity: 0.7, verticalAlign: '-1px', marginRight: 4 }} /> Chính sách bảo mật thông tin</a></li>
          </ul>
        </div>
        
        {/* Cột 4: Thông tin liên hệ */}
        <div className="footer-col footer-contact-col">
          <h4>Thông tin liên hệ</h4>
          <ul className="contact-list">
            <li>
              <IoLocationOutline style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
              <span>Số 298 Đ. Cầu Diễn, P. Minh Khai, Q. Bắc Từ Liêm, Hà Nội</span>
            </li>
            <li>
              <IoCallOutline style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
              <span>Hotline mua hàng: <strong>1800 1234</strong> (Miễn phí)</span>
            </li>
            <li>
              <IoHeadsetOutline style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
              <span>Khiếu nại &amp; CSKH: <strong>1800 5678</strong></span>
            </li>
            <li>
              <IoMailOutline style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
              <span>Email: hotro@phonezone.vn</span>
            </li>
            <li>
              <IoTimeOutline style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
              <span>Giờ mở cửa: 08:00 – 22:00 mỗi ngày</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-simple-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} PhoneZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
