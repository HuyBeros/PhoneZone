import { Link } from 'react-router-dom';
import { BRANDS } from '../data/data';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <i className="fas fa-mobile-screen-button"></i> Phone<span>Zone</span>
          </Link>
          <p>Hệ thống bán lẻ điện thoại di động chính hãng uy tín nhất Việt Nam. Cam kết chất lượng, giá tốt, dịch vụ tận tâm.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            <a href="#" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
          </div>
        </div>
        
        <div className="footer-col">
          <h4>Điện thoại theo hãng</h4>
          <ul>
            {BRANDS.slice(0, 6).map(b => (
              <li key={b.id}>
                <Link to={`/brand/${b.id}`}>
                  <i className="fas fa-angle-right"></i> {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Hỗ trợ &amp; Chính sách</h4>
          <ul>
            <li><a href="#"><i className="fas fa-angle-right"></i> Chính sách bảo hành</a></li>
            <li><a href="#"><i className="fas fa-angle-right"></i> Hướng dẫn đặt hàng</a></li>
            <li><a href="#"><i className="fas fa-angle-right"></i> Tra cứu đơn hàng</a></li>
            <li><Link to="/contact"><i className="fas fa-angle-right"></i> Liên hệ hỗ trợ</Link></li>
            <li><a href="#"><i className="fas fa-angle-right"></i> Chính sách bảo mật</a></li>
          </ul>
        </div>
        
        <div className="footer-col footer-contact-col">
          <h4>Thông tin liên hệ</h4>
          <ul className="contact-list">
            <li>
              <i className="fas fa-location-dot"></i>
              <span>Nhổn, Bắc Từ Liêm, Hà Nội</span>
            </li>
            <li>
              <i className="fas fa-phone"></i>
              <span>1800 1234 (miễn phí)</span>
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              <span>lienhe@phonezone.vn</span>
            </li>
            <li>
              <i className="fas fa-clock"></i>
              <span>8:00 – 22:00 mỗi ngày</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} PhoneZone. All rights reserved.</p>
          <div className="payment-icons">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-cc-paypal"></i>
            <i className="fab fa-cc-jcb"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
