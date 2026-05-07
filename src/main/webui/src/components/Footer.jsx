import { Link } from 'react-router-dom';
import { BRANDS } from '../data/data';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo">Phone<span>Zone</span></Link>
          <p>Chuỗi cửa hàng điện thoại chính hãng hàng đầu Việt Nam. Uy tín – Chất lượng – Giá tốt nhất.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            <a href="#" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
            <a href="#" aria-label="Zalo"><i className="fas fa-comment-dots"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Điện thoại theo hãng</h4>
          <ul>
            {BRANDS.map(b => (
              <li key={b.id}><Link to={`/brand/${b.id}`}>{b.emoji} {b.name}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Phụ kiện</h4>
          <ul>
            <li><a href="#">Tai nghe Bluetooth</a></li>
            <li><a href="#">Tai nghe chụp tai</a></li>
            <li><a href="#">Sạc &amp; cáp</a></li>
            <li><a href="#">Ốp lưng &amp; bao da</a></li>
            <li><a href="#">Pin dự phòng</a></li>
            <li><a href="#">Đồng hồ thông minh</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Hỗ trợ &amp; Chính sách</h4>
          <ul>
            <li><a href="#">Chính sách bảo hành</a></li>
            <li><a href="#">Hướng dẫn đặt hàng</a></li>
            <li><a href="#">Trả góp 0%</a></li>
            <li><a href="#">Tra cứu đơn hàng</a></li>
            <li><Link to="/contact">Liên hệ hỗ trợ</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Liên hệ</h4>
          <ul className="contact-list">
            <li><i className="fa fa-map-marker-alt"></i> 123 Cầu Giấy, Hà Nội</li>
            <li><i className="fa fa-map-marker-alt"></i> 456 Lê Văn Việt, TP.HCM</li>
            <li><i className="fa fa-phone"></i> 1800 1234 (miễn phí)</li>
            <li><i className="fa fa-envelope"></i> lienhe@phonezone.vn</li>
            <li><i className="fa fa-clock"></i> 8:00 – 22:00 mỗi ngày</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2025 PhoneZone. Bảo lưu mọi quyền. MST: 0123456789</p>
          <div className="payment-icons">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-cc-paypal"></i>
            <i className="fab fa-apple-pay"></i>
            <i className="fab fa-google-pay"></i>
          </div>
        </div>
      </div>
    </footer>
  );
}
