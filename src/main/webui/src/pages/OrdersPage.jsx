import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fmt } from '../utils/utils';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { fetchApi } from '../api/apiClient';

const STATUS_CONFIG = {
  'Đang xử lý':    { cls: 'status-pending',    icon: 'fa-clock',          label: 'Đang xử lý'    },
  'Đã xác nhận':   { cls: 'status-confirmed',  icon: 'fa-circle-check',   label: 'Đã xác nhận'  },
  'Đang giao':     { cls: 'status-shipping',   icon: 'fa-truck-fast',     label: 'Đang giao'     },
  'Hoàn thành':    { cls: 'status-done',       icon: 'fa-box-open',       label: 'Hoàn thành'    },
  'Đã hủy':        { cls: 'status-cancelled',  icon: 'fa-circle-xmark',   label: 'Đã hủy'        },
};

function OrderStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { cls: 'status-pending', icon: 'fa-circle-dot', label: status };
  return (
    <span className={`order-status-badge ${cfg.cls}`}>
      <i className={`fas ${cfg.icon}`}></i> {cfg.label}
    </span>
  );
}

function CancelConfirmModal({ onConfirm, onClose, orderId }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box cancel-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon cancel-icon">
          <i className="fas fa-triangle-exclamation"></i>
        </div>
        <h3>Xác nhận hủy đơn hàng</h3>
        <p>Bạn có chắc muốn hủy đơn hàng <strong>#{orderId}</strong> không?</p>
        <p className="cancel-modal-note">
          <i className="fas fa-info-circle"></i> Hàng sẽ được hoàn lại kho. Hành động này không thể hoàn tác.
        </p>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>
            <i className="fas fa-arrow-left"></i> Không, quay lại
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <i className="fas fa-ban"></i> Xác nhận hủy đơn
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadOrders = useCallback(() => {
    setLoading(true);
    fetchApi('/orders')
      .then(res => setOrders(res || []))
      .catch(err => console.error('Lỗi lấy đơn hàng', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    loadOrders();
  }, [token, navigate, loadOrders]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await fetchApi(`/orders/${cancelTarget}/cancel`, { method: 'PUT' });
      showToast('Hủy đơn hàng thành công!', 'success');
      setCancelTarget(null);
      loadOrders();
    } catch (err) {
      showToast(err?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      {cancelTarget && (
        <CancelConfirmModal
          orderId={cancelTarget}
          onConfirm={handleCancel}
          onClose={() => !cancelling && setCancelTarget(null)}
        />
      )}

      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fas fa-house"></i> Trang chủ</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
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
              <Link to="/profile"><i className="fas fa-user"></i> Hồ sơ của tôi</Link>
              <Link to="/orders" className="active"><i className="fas fa-box"></i> Đơn hàng mua</Link>
              <Link to="/rewards"><i className="fas fa-star"></i> Điểm &amp; Coupon</Link>
            </nav>
          </div>

          <div className="profile-content">
            <h2 className="pc-title">Đơn hàng của tôi</h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <p style={{ marginTop: '10px', color: 'var(--text2)' }}>Đang tải đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-box-open"></i>
                <h3>Bạn chưa có đơn hàng nào</h3>
                <Link to="/brand/all" className="btn btn-primary" style={{ marginTop: '10px' }}>Mua sắm ngay</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className={`order-card ${order.status === 'Đã hủy' ? 'order-cancelled' : ''}`}>
                    <div className="order-header">
                      <div className="order-header-left">
                        <span className="order-id">
                          <i className="fas fa-hashtag"></i> Mã đơn: <strong>#{order.id}</strong>
                        </span>
                        <span className="order-date">
                          <i className="fas fa-calendar-alt"></i> {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <OrderStatusBadge status={order.status} />
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
                        {order.discountAmount > 0 && (
                          <span style={{ fontSize: '0.82em', color: 'var(--text2)', display: 'block' }}>
                            <i className="fas fa-tag"></i> Đã giảm {fmt(order.discountAmount)}
                          </span>
                        )}
                      </div>
                      <div className="order-actions">
                        <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">
                          <i className="fas fa-eye"></i> Xem chi tiết
                        </Link>
                        {order.status === 'Đang xử lý' && (
                          <button
                            className="btn btn-cancel-order btn-sm"
                            onClick={() => setCancelTarget(order.id)}
                          >
                            <i className="fas fa-ban"></i> Hủy đơn
                          </button>
                        )}
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
