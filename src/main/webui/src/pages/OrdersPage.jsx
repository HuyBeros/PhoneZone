import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fmt } from '../utils/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('pz_orders') || '[]');
    setOrders(history);
  }, []);

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
              <div className="ps-avatar">NV</div>
              <div className="ps-info">
                <strong>Nguyễn Văn A</strong>
                <span>Thành viên Bạc</span>
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
            
            {orders.length === 0 ? (
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
                      <span className="order-date">{order.date}</span>
                      <span className="order-status text-warning">{order.status}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map(item => (
                        <div key={item.id} className="order-item">
                          <img src={item.img} alt={item.name} />
                          <div className="oi-info">
                            <div className="oi-name">{item.name}</div>
                            <div className="oi-qty">Số lượng: {item.quantity}</div>
                          </div>
                          <div className="oi-price">{fmt(item.price)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <div className="order-total">
                        Thành tiền: <strong>{fmt(order.total)}</strong>
                      </div>
                      <div className="order-actions">
                        <button className="btn btn-outline btn-sm">Xem chi tiết</button>
                        <button className="btn btn-primary btn-sm">Mua lại</button>
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
