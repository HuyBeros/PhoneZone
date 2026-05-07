import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fmt } from '../utils/utils';
import { useAuth } from '../store/AuthContext';
import { fetchApi } from '../api/apiClient';

export default function OrdersPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    
    setLoading(true);
    fetchApi('/orders')
      .then(res => setOrders(res || []))
      .catch(err => console.error("Lỗi lấy đơn hàng", err))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fa fa-home"></i> Trang chủ</Link>
          <span className="sep"><i className="fa fa-chevron-right"></i></span>
          <span>Đơn hàng của tôi</span>
        </div>

        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="ps-user">
              <div className="ps-avatar">{(user.fullName || user.username).charAt(0).toUpperCase()}</div>
              <div className="ps-info">
                <strong>{user.fullName || user.username}</strong>
                <span>Thành viên PhoneZone</span>
              </div>
            </div>
            <nav className="ps-nav">
              <Link to="/profile"><i className="fa fa-user"></i> Hồ sơ của tôi</Link>
              <Link to="/orders" className="active"><i className="fa fa-box"></i> Đơn hàng mua</Link>
              <Link to="/rewards"><i className="fa fa-star"></i> Điểm & Coupon</Link>
              <button className="ps-logout"><i className="fa fa-sign-out-alt"></i> Đăng xuất</button>
            </nav>
          </div>

          <div className="profile-content">
            <h2 className="pc-title">Đơn hàng của tôi</h2>
            
            {loading ? (
               <div>Đang tải đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <i className="fa fa-box-open"></i>
                <h3>Bạn chưa có đơn hàng nào</h3>
                <Link to="/brand/all" className="btn btn-primary" style={{marginTop: '10px'}}>Mua sắm ngay</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">Mã đơn: #{order.id}</span>
                      <span className="order-date">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                      <span className="order-status text-warning">{order.status}</span>
                    </div>
                    <div className="order-items">
                      {order.items && order.items.map(item => (
                        <div key={item.productId} className="order-item">
                          <img src={item.productImage} alt={item.productName} />
                          <div className="oi-info">
                            <div className="oi-name">{item.productName}</div>
                            <div className="oi-qty">Số lượng: {item.quantity}</div>
                          </div>
                          <div className="oi-price">{fmt(item.unitPrice)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div className="order-total">
                        Thành tiền: <strong>{fmt(order.finalAmount)}</strong>
                        {order.discountAmount > 0 && <span style={{fontSize: '0.85em', color: 'gray', display: 'block'}}>(Đã giảm {fmt(order.discountAmount)})</span>}
                      </div>
                      <div className="order-actions">
                        <button className="btn btn-outline btn-sm">Xem chi tiết</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
