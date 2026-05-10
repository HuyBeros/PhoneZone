import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './admin.css';
import { useAuth } from '../../store/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  
  const currentPath = location.pathname;

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo-container">
          <div className="admin-logo-icon">P</div>
          PhoneZone
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-group">Menu</div>
          <Link to="/admin" className={`admin-nav-item ${currentPath === '/admin' ? 'active' : ''}`}>
            <i className="fas fa-border-all"></i> Dashboard
          </Link>

          <div className="admin-nav-group">Quản Lý</div>
          <Link to="/admin/products" className={`admin-nav-item ${currentPath.includes('/admin/products') ? 'active' : ''}`}>
            <i className="fas fa-box"></i> Sản Phẩm
          </Link>
          <Link to="/admin/orders" className={`admin-nav-item ${currentPath.includes('/admin/orders') ? 'active' : ''}`}>
            <i className="fas fa-receipt"></i> Đơn Hàng
          </Link>
          <Link to="/admin/users" className={`admin-nav-item ${currentPath.includes('/admin/users') ? 'active' : ''}`}>
            <i className="fas fa-users"></i> Tài Khoản
          </Link>
          <Link to="/admin/coupons" className={`admin-nav-item ${currentPath.includes('/admin/coupons') ? 'active' : ''}`}>
            <i className="fas fa-ticket-alt"></i> Khuyến Mãi
          </Link>
          <Link to="/admin/repairs" className={`admin-nav-item ${currentPath.includes('/admin/repairs') ? 'active' : ''}`}>
            <i className="fas fa-tools"></i> Sửa Chữa
          </Link>
          <Link to="/admin/contacts" className={`admin-nav-item ${currentPath.includes('/admin/contacts') ? 'active' : ''}`}>
            <i className="fas fa-envelope"></i> Tin Nhắn
          </Link>

          <div className="admin-nav-group">Hệ Thống</div>
          <Link to="/" className="admin-nav-item">
            <i className="fas fa-store"></i> Về Cửa Hàng
          </Link>
        </nav>

        <div className="admin-sidebar-profile">
          <div className="admin-profile-card" onClick={handleLogout}>
            <div className="admin-profile-avatar">
              {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="admin-profile-info">
              <div className="admin-profile-name">{user?.fullName || user?.username || 'Admin'}</div>
              <div className="admin-profile-role">Quản trị viên</div>
            </div>
            <i className="fas fa-sign-out-alt" title="Đăng xuất"></i>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Tìm kiếm..." />
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-topbar-greeting">
              Xin chào, <strong>{user?.fullName || user?.username || 'Admin'}</strong>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
