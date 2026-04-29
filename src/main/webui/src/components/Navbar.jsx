import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRANDS } from '../data/data';
import { useCart } from '../store/CartContext';
import { usePoints } from '../store/PointsContext';

/* ── Mock user state (thay bằng AuthContext thực khi có backend) ── */
const MOCK_USER = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  avatar: null, // null = dùng initials
};

function getInitials(name) {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();
}

/* ── User Dropdown ── */
function UserDropdown({ user, onLogout }) {
  return (
    <div className="user-dropdown-wrap">
      {/* Trigger */}
      <div className="user-trigger">
        <div className="user-avatar">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} />
            : <span>{getInitials(user.name)}</span>
          }
        </div>
        <div className="user-info-mini">
          <span className="user-name-mini">{user.name.split(' ').pop()}</span>
          <i className="fa fa-chevron-down user-caret"></i>
        </div>
      </div>

      {/* Dropdown menu */}
      <div className="user-dropdown">
        {/* Header */}
        <div className="ud-header">
          <div className="ud-avatar">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} />
              : <span>{getInitials(user.name)}</span>
            }
          </div>
          <div className="ud-info">
            <div className="ud-name">{user.name}</div>
            <div className="ud-email">{user.email}</div>
          </div>
        </div>

        <div className="ud-divider"></div>

        {/* Menu items */}
        <Link to="/profile" className="ud-item">
          <span className="ud-item-icon"><i className="fa fa-user-edit"></i></span>
          <div>
            <div className="ud-item-label">Thông tin cá nhân</div>
            <div className="ud-item-sub">Chỉnh sửa hồ sơ, địa chỉ</div>
          </div>
        </Link>

        <Link to="/rewards" className="ud-item">
          <span className="ud-item-icon ud-icon-gold"><i className="fa fa-ticket-alt"></i></span>
          <div>
            <div className="ud-item-label">Coupon của tôi</div>
            <div className="ud-item-sub">Xem & sử dụng mã giảm giá</div>
          </div>
        </Link>

        <Link to="/orders" className="ud-item">
          <span className="ud-item-icon ud-icon-blue"><i className="fa fa-box"></i></span>
          <div>
            <div className="ud-item-label">Đơn hàng của tôi</div>
            <div className="ud-item-sub">Theo dõi trạng thái giao hàng</div>
          </div>
        </Link>

        <Link to="/rewards" className="ud-item">
          <span className="ud-item-icon ud-icon-yellow"><i className="fa fa-star"></i></span>
          <div>
            <div className="ud-item-label">Điểm thưởng</div>
            <div className="ud-item-sub">Đổi điểm lấy coupon ưu đãi</div>
          </div>
        </Link>

        <div className="ud-divider"></div>

        <button className="ud-item ud-logout" onClick={onLogout}>
          <span className="ud-item-icon ud-icon-red"><i className="fa fa-sign-out-alt"></i></span>
          <div>
            <div className="ud-item-label">Đăng xuất</div>
            <div className="ud-item-sub">Tạm biệt, {user.name.split(' ').pop()}!</div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ── Navbar ── */
export default function Navbar() {
  const { cartCount, openCart } = useCart();
  const { points } = usePoints();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('pz_logged') === '1'
  );
  const megaRef = useRef(null);

  // Đóng mega menu khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sticky scroll styling
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleLogin = () => {
    localStorage.setItem('pz_logged', '1');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pz_logged');
    setIsLoggedIn(false);
  };

  return (
    <header className="navbar" id="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="logo">Phone<span>Zone</span></Link>

        {/* Nav links */}
        <nav className={`nav-links${mobileOpen ? ' open' : ''}`} id="navLinks">
          <Link to="/" className="nav-link" onClick={closeMobile}>Trang chủ</Link>

          {/* Điện thoại với hover dropdown */}
          <div className="nav-dropdown-wrap">
            <Link to="/brand/all" className="nav-link nav-link-has-dropdown" onClick={closeMobile}>
              Điện thoại <i className="fa fa-chevron-down nav-caret"></i>
            </Link>
            <div className="nav-dropdown">
              {BRANDS.map(b => (
                <Link
                  key={b.id}
                  className="nav-dd-item"
                  to={`/brand/${b.id}`}
                  onClick={closeMobile}
                >
                  <span className="dd-emoji">{b.emoji}</span> {b.name}
                </Link>
              ))}
              <div className="nav-dd-divider"></div>
              <Link className="nav-dd-all" to="/brand/all" onClick={closeMobile}>
                <i className="fa fa-th-large"></i> Xem tất cả hãng
              </Link>
            </div>
          </div>

          <Link to="/#accessory" className="nav-link" onClick={closeMobile}>Phụ kiện</Link>
          <Link to="/#contact" className="nav-link" onClick={closeMobile}>Liên hệ</Link>
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <div className="search-box">
            <input type="text" placeholder="Tìm điện thoại, phụ kiện..." id="searchInput" />
            <button aria-label="Tìm kiếm"><i className="fa fa-search"></i></button>
          </div>

          <Link to="/rewards" className="icon-btn rewards-nav-btn" title="Điểm thưởng">
            <i className="fa fa-star"></i>
            <span className="badge rewards-badge">{points}</span>
          </Link>


          <button className="icon-btn" aria-label="Giỏ hàng" onClick={openCart}>
            <i className="fa fa-shopping-cart"></i>
            <span className="badge">{cartCount}</span>
          </button>

          {/* User section */}
          {isLoggedIn ? (
            <UserDropdown user={MOCK_USER} onLogout={handleLogout} />
          ) : (
            <button className="btn-login" onClick={handleLogin}>
              <i className="fa fa-user-circle"></i>
              <span>Đăng nhập</span>
            </button>
          )}

          <button className="hamburger" aria-label="Menu" onClick={() => setMobileOpen(v => !v)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
