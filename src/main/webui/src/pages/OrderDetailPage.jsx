import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

function CancelConfirmModal({ onConfirm, onClose, orderId, cancelling }) {
  return (
    <div className="modal-overlay" onClick={() => !cancelling && onClose()}>
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
          <button className="btn btn-outline" onClick={onClose} disabled={cancelling}>
            <i className="fas fa-arrow-left"></i> Không, quay lại
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={cancelling}>
            {cancelling
              ? <><i className="fas fa-spinner fa-spin"></i> Đang hủy...</>
              : <><i className="fas fa-ban"></i> Xác nhận hủy đơn</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = () => {
    setLoading(true);
    fetchApi(`/orders/${id}`)
      .then(res => setOrder(res))
      .catch(err => {
        console.error('Lỗi lấy chi tiết đơn hàng', err);
        setOrder(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    loadOrder();
  }, [id, token, navigate]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await fetchApi(`/orders/${id}/cancel`, { method: 'PUT' });
      showToast('Hủy đơn hàng thành công!', 'success');
      setShowCancelModal(false);
      loadOrder();
    } catch (err) {
      showToast(err?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) return null;

  const canCancel = order && order.status === 'Đang xử lý';

  return (
    <div className="profile-page">
      {showCancelModal && (
        <CancelConfirmModal
          orderId={id}
          cancelling={cancelling}
          onConfirm={handleCancel}
          onClose={() => !cancelling && setShowCancelModal(false)}
        />
      )}

      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fas fa-house"></i> Trang chủ</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
          <Link to="/orders">Đơn hàng của tôi</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
          <span>Chi tiết đơn hàng #{id}</span>
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
            <div className="od-header">
              <div className="od-header-left">
                <Link to="/orders" className="btn btn-outline btn-sm" style={{ marginRight: '15px' }}>
                  <i className="fas fa-arrow-left"></i> Quay lại
                </Link>
                <h2 className="pc-title" style={{ margin: 0 }}>Chi tiết đơn hàng #{id}</h2>
              </div>
              <div className="od-header-right">
                {order && <OrderStatusBadge status={order.status} />}
                {canCancel && (
                  <button
                    className="btn btn-cancel-order btn-sm"
                    onClick={() => setShowCancelModal(true)}
                    style={{ marginLeft: '10px' }}
                  >
                    <i className="fas fa-ban"></i> Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
                <p style={{ marginTop: '10px' }}>Đang tải chi tiết đơn hàng...</p>
              </div>
            ) : !order ? (
              <div className="empty-state">
                <i className="fas fa-exclamation-circle" style={{ color: '#dc2626' }}></i>
                <h3>Không tìm thấy đơn hàng</h3>
                <p>Đơn hàng không tồn tại hoặc bạn không có quyền xem.</p>
                <Link to="/orders" className="btn btn-primary" style={{ marginTop: '15px' }}>Về danh sách đơn hàng</Link>
              </div>
            ) : (
              <div className="od-details">
                <div className="od-date">
                  <i className="fas fa-calendar-alt"></i> Ngày đặt hàng: <strong>{new Date(order.createdAt).toLocaleString('vi-VN')}</strong>
                </div>

                {order.status === 'Đã hủy' && (
                  <div className="od-cancelled-notice">
                    <i className="fas fa-circle-xmark"></i>
                    <div>
                      <strong>Đơn hàng đã bị hủy</strong>
                      <span>Hàng đã được hoàn lại kho. Nếu bạn đã thanh toán, vui lòng liên hệ hỗ trợ để được hoàn tiền.</span>
                    </div>
                  </div>
                )}

                <div className="od-grid">
                  <div className="od-card">
                    <h3 className="od-card-title"><i className="fas fa-map-marker-alt"></i> Địa chỉ nhận hàng</h3>
                    <div className="od-card-content">
                      <div className="od-name">{order.shippingAddress?.fullName || user.fullName}</div>
                      <div className="od-text"><strong>SĐT:</strong> {order.shippingAddress?.phone || user.phone || 'Chưa cập nhật'}</div>
                      <div className="od-text"><strong>Địa chỉ:</strong> {order.shippingAddress?.address || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div className="od-card">
                    <h3 className="od-card-title"><i className="fas fa-credit-card"></i> Hình thức thanh toán</h3>
                    <div className="od-card-content">
                      <div className="od-text">
                        {order.paymentMethod === 'VNPAY' ? (
                          <><span className="od-pm-badge pm-vnpay">VNPAY</span> Thanh toán qua VNPAY</>
                        ) : order.paymentMethod === 'COD' ? (
                          <><span className="od-pm-badge pm-cod">COD</span> Thanh toán khi nhận hàng</>
                        ) : (
                          <><span className="od-pm-badge">{order.paymentMethod}</span> Chuyển khoản / Khác</>
                        )}
                      </div>
                      <div className="od-text" style={{ marginTop: '10px' }}>
                        <strong>Trạng thái:</strong> {order.paymentMethod === 'VNPAY' && order.status !== 'Đang xử lý' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="od-items-section">
                  <h3 className="od-section-title">Sản phẩm đã mua</h3>
                  <div className="od-items">
                    {order.items && order.items.map(item => (
                      <div key={item.productId} className="od-item">
                        <img src={item.productImage} alt={item.productName} />
                        <div className="od-item-info">
                          <Link to={`/product/${item.productId}`} className="od-item-name">{item.productName}</Link>
                          <div className="od-item-meta">
                            <span className="od-item-price">{fmt(item.unitPrice)}</span>
                            <span className="od-item-qty">x{item.quantity}</span>
                          </div>
                        </div>
                        <div className="od-item-total">{fmt(item.unitPrice * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="od-summary">
                  <div className="od-summary-row">
                    <span>Tạm tính</span>
                    <span>{fmt(order.totalAmount)}</span>
                  </div>
                  <div className="od-summary-row">
                    <span>Phí vận chuyển</span>
                    <span>0 đ</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="od-summary-row od-discount">
                      <span>Khuyến mãi / Mã giảm giá</span>
                      <span>- {fmt(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="od-summary-row od-final">
                    <span>Tổng cộng</span>
                    <span className="od-final-price">{fmt(order.finalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
