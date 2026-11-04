import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function RequireAuth({ role }) {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    // Wait for /users/me before mounting pages that redirect when user is null.
    if (loading) {
        return <div className="container" role="status" style={{ padding: '64px 0' }}>Đang kiểm tra phiên đăng nhập...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    }

    if (!user) {
        return (
            <div className="container" role="alert" style={{ padding: '64px 0' }}>
                <h2>Chưa tải được thông tin tài khoản</h2>
                <p>Vui lòng kiểm tra kết nối và thử lại.</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        );
    }

    if (role && user.role !== role) {
        return (
            <div className="container" role="alert" style={{ padding: '64px 0' }}>
                <h2>Bạn không có quyền truy cập trang này</h2>
                <Link to="/" className="btn btn-primary">Về trang chủ</Link>
            </div>
        );
    }

    return <Outlet />;
}
