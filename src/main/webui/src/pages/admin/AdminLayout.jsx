import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './admin.css';
import './admin-responsive.css';
import { useDrawer, useMediaQuery } from '../../hooks/useDrawer';
import { useAuth } from '../../store/AuthContext';
import {
  IoGridOutline,
  IoPhonePortraitOutline,
  IoReceiptOutline,
  IoPeopleOutline,
  IoTicketOutline,
  IoConstructOutline,
  IoMailOutline,
  IoStorefrontOutline,
  IoLogOutOutline,
  IoSearchOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileAdmin = useMediaQuery('(max-width: 1024px)');
  const drawerRef = useDrawer(menuOpen && mobileAdmin, () => setMenuOpen(false));
  useEffect(() => { setMenuOpen(false); }, [location.pathname, mobileAdmin]);

  const currentPath = location.pathname;

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  const displayName = user?.fullName || user?.username || 'Quản trị viên';
  const avatarLetter = (displayName.charAt(0) || 'A').toUpperCase();

  return (
    <div className="admin-layout">
      {/* ── SIDEBAR ── */}
      {mobileAdmin && menuOpen && <div className="admin-menu-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
      <aside ref={drawerRef} id="adminNavigation" className={`admin-sidebar${menuOpen ? ' is-open' : ''}`} role={mobileAdmin ? 'dialog' : undefined} aria-modal={mobileAdmin && menuOpen ? true : undefined} aria-label="Điều hướng quản trị" inert={mobileAdmin && !menuOpen ? '' : undefined} tabIndex={-1}>
        {/* BRAND LOGO */}
        <div className="admin-logo-container">
          <button type="button" className="admin-menu-close" onClick={() => setMenuOpen(false)} aria-label="Đóng menu quản trị"><IoCloseOutline /></button>
          <Link to="/admin" className="admin-brand-link">
            <div className="admin-logo-icon">
              <IoPhonePortraitOutline />
            </div>
            <div className="admin-logo-text-group">
              <span className="admin-logo-text">PhoneZone</span>
              <span className="admin-logo-badge">Admin</span>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="admin-nav">
          <div className="admin-nav-group">Tổng Quan</div>
          <Link
            to="/admin"
            className={`admin-nav-item ${currentPath === '/admin' ? 'active' : ''}`}
          >
            <IoGridOutline className="admin-nav-icon" />
            <span>Dashboard</span>
          </Link>

          <div className="admin-nav-group">Quản Lý Cửa Hàng</div>
          <Link
            to="/admin/products"
            className={`admin-nav-item ${currentPath.startsWith('/admin/products') ? 'active' : ''}`}
          >
            <IoPhonePortraitOutline className="admin-nav-icon" />
            <span>Sản Phẩm</span>
          </Link>
          <Link
            to="/admin/orders"
            className={`admin-nav-item ${currentPath.startsWith('/admin/orders') ? 'active' : ''}`}
          >
            <IoReceiptOutline className="admin-nav-icon" />
            <span>Đơn Hàng</span>
          </Link>
          <Link
            to="/admin/users"
            className={`admin-nav-item ${currentPath.startsWith('/admin/users') ? 'active' : ''}`}
          >
            <IoPeopleOutline className="admin-nav-icon" />
            <span>Tài Khoản</span>
          </Link>
          <Link
            to="/admin/coupons"
            className={`admin-nav-item ${currentPath.startsWith('/admin/coupons') ? 'active' : ''}`}
          >
            <IoTicketOutline className="admin-nav-icon" />
            <span>Khuyến Mãi</span>
          </Link>

          <div className="admin-nav-group">Dịch Vụ &amp; CSKH</div>
          <Link
            to="/admin/repairs"
            className={`admin-nav-item ${currentPath.startsWith('/admin/repairs') ? 'active' : ''}`}
          >
            <IoConstructOutline className="admin-nav-icon" />
            <span>Lịch Sửa Chữa</span>
          </Link>
          <Link
            to="/admin/contacts"
            className={`admin-nav-item ${currentPath.startsWith('/admin/contacts') ? 'active' : ''}`}
          >
            <IoMailOutline className="admin-nav-icon" />
            <span>Tin Nhắn Khách</span>
          </Link>

          <div className="admin-nav-group">Hệ Thống</div>
          <Link to="/" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
            <IoStorefrontOutline className="admin-nav-icon" />
            <span>Xem Cửa Hàng</span>
          </Link>
        </nav>

        {/* SIDEBAR FOOTER PROFILE */}
        <div className="admin-sidebar-profile">
          <div className="admin-profile-card">
            <div className="admin-profile-avatar">
              {avatarLetter}
            </div>
            <div className="admin-profile-info">
              <div className="admin-profile-name" title={displayName}>{displayName}</div>
              <div className="admin-profile-role">
                <IoShieldCheckmarkOutline style={{ fontSize: '0.8rem', marginRight: '4px' }} />
                Quản trị viên
              </div>
            </div>
            <button
              type="button"
              className="admin-profile-logout"
              onClick={handleLogout}
              title="Đăng xuất khỏi hệ thống"
            >
              <IoLogOutOutline />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <button type="button" className="admin-menu-toggle" aria-label="Mở menu quản trị" aria-expanded={menuOpen} aria-controls="adminNavigation" onClick={() => setMenuOpen(true)}><IoMenuOutline /></button>
          <div className="admin-search">
            <IoSearchOutline className="admin-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng, sản phẩm, khách hàng..."
              readOnly
              onClick={() => navigate('/admin/orders')}
              style={{ cursor: 'pointer' }}
            />
          </div>
          <div className="admin-topbar-actions">
            <Link to="/" className="admin-store-link" title="Mở trang bán hàng">
              <IoStorefrontOutline />
              <span>Xem Cửa Hàng</span>
            </Link>
            <div className="admin-topbar-greeting">
              Xin chào, <strong>{displayName}</strong>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout} title="Đăng xuất">
              <IoLogOutOutline style={{ fontSize: '1.15rem' }} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
