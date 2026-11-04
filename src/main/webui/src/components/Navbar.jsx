import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BRANDS } from '../data/data';
import { fmt, mapProduct } from '../utils/utils';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { fetchApi } from '../api/apiClient';
import { useMediaQuery } from '../hooks/useDrawer';
import {
  IoChevronDown,
  IoShieldCheckmarkOutline,
  IoArrowForward,
  IoPersonOutline,
  IoBagCheckOutline,
  IoHeart,
  IoHeartOutline,
  IoTicketOutline,
  IoLogOutOutline,
  IoLocationOutline,
  IoCallOutline,
  IoSearchOutline,
  IoFlameOutline,
  IoReloadOutline,
  IoCartOutline,
  IoPersonCircleOutline,
} from 'react-icons/io5';

/* ── Name & Initials Helpers ── */
function formatDisplayName(user) {
  if (!user) return 'Người dùng';
  const raw = (user.fullName && user.fullName.trim()) || user.username || 'Người dùng';
  return raw.replace(/\b\w/g, l => l.toUpperCase());
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1].slice(0, 1).toUpperCase();
}

/* ── Popular Search Keywords ── */
const POPULAR_SEARCHES = [
  'iPhone 16 Pro Max',
  'Samsung S24 Ultra',
  'Xiaomi 14T',
  'iPad Air 6',
  'OPPO Find X7',
  'Sửa chữa thay pin'
];

/* ── User Dropdown ── */
function UserDropdown({ user, onLogout }) {
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { wishlistCount, openWishlist } = useWishlist();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = formatDisplayName(user);
  const shortName = fullName.split(/\s+/).pop();
  const avatarLetter = getInitials(shortName);

  return (
    <div
      className={`user-dropdown-wrap${menuOpen ? ' is-open' : ''}`}
      ref={dropdownRef}
      onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false); }}
    >
      {/* Trigger */}
      <button
        type="button"
        className="user-trigger"
        aria-label="Menu tài khoản"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(v => !v)}
      >
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={fullName} />
          ) : (
            <span>{avatarLetter}</span>
          )}
        </div>
        <div className="user-info-mini">
          <span className="user-name-mini">{shortName}</span>
          {isAdmin && <span className="admin-badge-mini">Admin</span>}
          <IoChevronDown className="user-caret" style={{ fontSize: '0.8rem' }} />
        </div>
      </button>

      {/* Dropdown menu */}
      <div className="user-dropdown" inert={!menuOpen ? '' : undefined}>
        {/* Header */}
        <div className="ud-header">
          <div className="ud-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={fullName} />
            ) : (
              <span>{avatarLetter}</span>
            )}
          </div>
          <div className="ud-info">
            <div className="ud-name">
              {fullName}
              {isAdmin && <span className="ud-admin-tag">Admin</span>}
            </div>
            <div className="ud-email">{user.email || 'Thành viên PhoneZone'}</div>
          </div>
        </div>

        <div className="ud-divider"></div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <>
            <Link to="/admin" className="ud-item ud-admin-item">
              <span className="ud-item-icon ud-icon-admin"><IoShieldCheckmarkOutline style={{ fontSize: '1.1rem' }} /></span>
              <div>
                <div className="ud-item-label">Trang quản trị</div>
                <div className="ud-item-sub">Quản lý sản phẩm, đơn hàng</div>
              </div>
              <IoArrowForward className="ud-admin-arrow" style={{ fontSize: '0.85rem' }} />
            </Link>
            <div className="ud-divider"></div>
          </>
        )}

        {/* Menu items */}
        <Link to="/profile" className="ud-item">
          <span className="ud-item-icon"><IoPersonOutline style={{ fontSize: '1.1rem' }} /></span>
          <div>
            <div className="ud-item-label">Thông tin cá nhân</div>
            <div className="ud-item-sub">Hồ sơ, địa chỉ giao hàng</div>
          </div>
        </Link>

        <Link to="/orders" className="ud-item">
          <span className="ud-item-icon ud-icon-blue"><IoBagCheckOutline style={{ fontSize: '1.1rem' }} /></span>
          <div>
            <div className="ud-item-label">Đơn hàng của tôi</div>
            <div className="ud-item-sub">Theo dõi trạng thái giao hàng</div>
          </div>
        </Link>

        <button
          type="button"
          className="ud-item"
          onClick={() => { setMenuOpen(false); openWishlist(); }}
        >
          <span className="ud-item-icon ud-icon-red"><IoHeartOutline style={{ fontSize: '1.1rem' }} /></span>
          <div>
            <div className="ud-item-label">
              Sản phẩm yêu thích {wishlistCount > 0 && `(${wishlistCount})`}
            </div>
            <div className="ud-item-sub">Xem các sản phẩm đã lưu</div>
          </div>
        </button>

        <Link to="/rewards" className="ud-item">
          <span className="ud-item-icon ud-icon-gold"><IoTicketOutline style={{ fontSize: '1.1rem' }} /></span>
          <div>
            <div className="ud-item-label">Coupon &amp; Mã giảm giá</div>
            <div className="ud-item-sub">Xem &amp; sử dụng mã ưu đãi</div>
          </div>
        </Link>

        <div className="ud-divider"></div>

        <button type="button" className="ud-item ud-logout" onClick={onLogout}>
          <span className="ud-item-icon ud-icon-red"><i className="fas fa-right-from-bracket"></i></span>
          <div>
            <div className="ud-item-label">Đăng xuất</div>
            <div className="ud-item-sub">Tạm biệt, {shortName}!</div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ── Navbar Main ── */
export default function Navbar() {
  const { cartCount, cartTotal, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const mobileNav = useMediaQuery('(max-width: 1200px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setBrandsOpen(false);
    setSearchFocused(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileNav) setMobileOpen(false);
  }, [mobileNav]);

  useEffect(() => {
    const dismiss = event => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
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

  const handleLogin = () => navigate('/login');
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length > 1) {
      setSearchLoading(true);
      try {
        const res = await fetchApi(`/products/search?q=${encodeURIComponent(val)}`);
        setSearchResults((res || []).slice(0, 5).map(mapProduct));
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
      setSearchLoading(false);
    }
  };

  const goToProduct = (id) => {
    setSearchTerm('');
    setSearchFocused(false);
    navigate(`/product/${id}`);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const keyword = searchTerm.trim();
    if (!keyword) return;
    navigate(`/brand/all?q=${encodeURIComponent(keyword)}`);
    setSearchTerm('');
    setSearchFocused(false);
    closeMobile();
  };

  const pickPopularKeyword = (kw) => {
    setSearchTerm(kw);
    navigate(`/brand/all?q=${encodeURIComponent(kw)}`);
    setSearchFocused(false);
    closeMobile();
  };

  const currentPath = location.pathname;

  return (
    <>
      {/* ── TOPBAR THÔNG TIN & ƯU ĐÃI ── */}
      <div className="topbar">
        <div className="container topbar-inner">
          <span className="topbar-promo">
            <i className="fas fa-truck-fast"></i> Miễn phí giao hàng từ 300K
            <span className="topbar-dot">·</span>
            <i className="fas fa-percent"></i> Trả góp 0% duyệt 5 phút
          </span>
          <div className="topbar-right">
            <a href="tel:18001234" className="topbar-link" title="Gọi tổng đài miễn phí">
              <i className="fas fa-phone-volume"></i> Hotline: <strong>1800 1234</strong> (Miễn phí)
            </a>
            <span className="topbar-divider">|</span>
            <a
              href="https://maps.google.com/?q=298+Đ.+Cầu+Diễn,+Minh+Khai,+Bắc+Từ+Liêm,+Hà+Nội"
              target="_blank"
              rel="noopener noreferrer"
              className="topbar-link"
              title="Xem vị trí cửa hàng trên Google Maps"
            >
              <i className="fas fa-location-dot"></i> Cửa hàng: Nhổn, Bắc Từ Liêm, HN
            </a>
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <header className="navbar" id="navbar">
        <div className="container navbar-inner">
          {/* Logo đồng nhất viết liền PhoneZone */}
          <Link to="/" className="logo">
            <i className="fas fa-mobile-screen-button logo-icon"></i>PhoneZone
          </Link>

          {/* Nav links (không bao giờ ngắt 2 dòng) */}
          <nav className={`nav-links${mobileOpen ? ' open' : ''}`} id="navLinks" aria-label="Điều hướng chính" inert={mobileNav && !mobileOpen ? '' : undefined}>
            <Link
              to="/"
              className={`nav-link${currentPath === '/' ? ' active' : ''}`}
              onClick={closeMobile}
            >
              Trang chủ
            </Link>

            {/* Điện thoại với hover dropdown */}
            <div className={`nav-dropdown-wrap${brandsOpen ? ' brands-open' : ''}`}>
              <Link
                to="/brand/all"
                className={`nav-link nav-link-has-dropdown${currentPath.startsWith('/brand') ? ' active' : ''}`}
                onClick={closeMobile}
              >
                Điện thoại <i className="fas fa-chevron-down nav-caret"></i>
              </Link>
              <button type="button" className="mobile-brands-toggle" aria-label="Danh sách hãng điện thoại" aria-expanded={brandsOpen} aria-controls="navBrands" onClick={() => setBrandsOpen(value => !value)}>
                <IoChevronDown />
              </button>
              <div className="nav-dropdown" id="navBrands" inert={mobileNav && !brandsOpen ? '' : undefined}>
                <div className="nav-dropdown-brands">
                  {BRANDS.map(b => (
                    <Link
                      key={b.id}
                      className="nav-dd-item"
                      to={`/brand/${b.id}`}
                      onClick={closeMobile}
                    >
                      <div className="dd-logo-wrap">
                        {b.logo ? (
                          <img src={b.logo} alt={b.name} className="dd-logo" />
                        ) : (
                          <span className="dd-dot" style={{ backgroundColor: b.color }}></span>
                        )}
                      </div>
                      <span className="dd-brand-name">{b.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="nav-dd-divider"></div>
                <Link className="nav-dd-all" to="/brand/all" onClick={closeMobile}>
                  <i className="fas fa-grip"></i> Xem tất cả hãng
                </Link>
              </div>
            </div>

            <Link
              to="/tablet"
              className={`nav-link${currentPath.startsWith('/tablet') ? ' active' : ''}`}
              onClick={closeMobile}
            >
              Máy tính bảng
            </Link>

            <Link
              to="/repair"
              className={`nav-link${currentPath.startsWith('/repair') ? ' active' : ''}`}
              onClick={closeMobile}
            >
              Sửa chữa
            </Link>

            <Link
              to="/contact"
              className={`nav-link${currentPath === '/contact' ? ' active' : ''}`}
              onClick={closeMobile}
            >
              Liên hệ
            </Link>
            <button type="button" className="nav-link mobile-wishlist-link" onClick={() => { closeMobile(); openWishlist(); }}>Sản phẩm yêu thích</button>
          </nav>

          {/* Actions */}
          <div className="nav-actions">
            {/* Search Box with Autocomplete & Popular Searches */}
            <form className="search-box" ref={searchRef} onSubmit={submitSearch}>
              <input
                type="text"
                placeholder="Tìm điện thoại, tablet..."
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() => setSearchFocused(true)}
                aria-label="Tìm kiếm sản phẩm"
              />
              <button type="submit" aria-label="Tìm kiếm"><IoSearchOutline style={{ fontSize: '1.1rem' }} /></button>

              {searchFocused && (
                <div className="search-dropdown-menu">
                  {/* Trường hợp 1: Chưa nhập chữ -> Hiển thị từ khóa hot */}
                  {searchTerm.trim().length <= 1 && (
                    <div className="search-popular-wrap">
                      <div className="sp-title">
                        <IoFlameOutline style={{ color: '#f97316', verticalAlign: '-2px', marginRight: 4 }} /> Tìm kiếm phổ biến
                      </div>
                      <div className="sp-tags">
                        {POPULAR_SEARCHES.map(kw => (
                          <button
                            key={kw}
                            type="button"
                            className="sp-tag-btn"
                            onClick={() => pickPopularKeyword(kw)}
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trường hợp 2: Đang nhập -> Hiển thị kết quả tìm kiếm */}
                  {searchTerm.trim().length > 1 && (
                    <div className="search-results-list">
                      {searchLoading && (
                        <div className="sr-loading">
                          <IoReloadOutline className="fa-spin" style={{ verticalAlign: '-2px', marginRight: 4 }} /> Đang tìm sản phẩm...
                        </div>
                      )}

                      {!searchLoading && searchResults.length > 0 && (
                        <>
                          <div className="sr-header">Sản phẩm gợi ý</div>
                          {searchResults.map(p => (
                            <div key={p.id} className="search-result-item" onClick={() => goToProduct(p.id)}>
                              <img src={p.img} alt={p.name} className="sr-thumb" />
                              <div className="sr-info">
                                <div className="sr-name" title={p.name}>{p.name}</div>
                                <div className="sr-price-row">
                                  <span className="sr-price">{fmt(p.price)}</span>
                                  {p.oldPrice && p.oldPrice > p.price && (
                                    <span className="sr-old-price">{fmt(p.oldPrice)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <button type="submit" className="sr-all-btn">
                            Xem tất cả kết quả cho "{searchTerm}" <IoArrowForward style={{ verticalAlign: '-1px', marginLeft: 4 }} />
                          </button>
                        </>
                      )}

                      {!searchLoading && searchResults.length === 0 && (
                        <div className="sr-empty">
                          Không tìm thấy sản phẩm nào khớp với "{searchTerm}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Yêu thích (Wishlist mở Drawer trực tiếp) */}
            <button
              type="button"
              className={`icon-btn wish-nav-btn${wishlistCount > 0 ? ' has-items' : ''}`}
              aria-label="Yêu thích"
              title="Danh sách yêu thích"
              onClick={openWishlist}
            >
              {wishlistCount > 0 ? <IoHeart style={{ color: '#ef4444', fontSize: '1.25rem' }} /> : <IoHeartOutline style={{ fontSize: '1.25rem' }} />}
              {wishlistCount > 0 && <span className="badge wish-badge">{wishlistCount}</span>}
            </button>

            {/* Giỏ hàng */}
            <button
              type="button"
              className={`icon-btn cart-nav-btn${cartCount > 0 ? ' has-items' : ''}`}
              aria-label="Giỏ hàng"
              title="Giỏ hàng của bạn"
              onClick={openCart}
            >
              <IoCartOutline style={{ fontSize: '1.3rem' }} />
              {cartCount > 0 && <span className="badge cart-badge">{cartCount}</span>}
              {cartTotal > 0 && <span className="cart-nav-total">{fmt(cartTotal)}</span>}
            </button>

            {/* User section */}
            {user ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              <button type="button" className="btn-login" onClick={handleLogin} aria-label="Đăng nhập">
                <IoPersonCircleOutline style={{ fontSize: '1.25rem', marginRight: 4, verticalAlign: '-2px' }} />
                <span>Đăng nhập</span>
              </button>
            )}

            <button
              type="button"
              className={`hamburger${mobileOpen ? ' is-active' : ''}`}
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
              aria-controls="navLinks"
              onClick={() => setMobileOpen(v => !v)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>
      {mobileNav && mobileOpen && <div className="mobile-nav-backdrop" onClick={closeMobile} aria-hidden="true" />}
    </>
  );
}
