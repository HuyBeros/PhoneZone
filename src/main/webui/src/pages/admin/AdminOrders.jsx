import { useAdminFeedback } from '../../store/AdminFeedbackContext';
import { useState, useEffect } from 'react';
import { useToast } from '../../store/ToastContext';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';
import {
  IoSearchOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
  IoCheckmarkDoneOutline,
  IoRefreshOutline,
  IoEyeOutline,
  IoReceiptOutline,
  IoBagCheckOutline,
  IoPersonOutline,
  IoCallOutline,
  IoLocationOutline,
  IoCardOutline
} from 'react-icons/io5';

const STATUS_CONFIG = {
  'Đang xử lý': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'Đang xử lý' },
  'Admin xác nhận & giao': { color: '#1d6ef5', bg: 'rgba(29, 110, 245, 0.12)', label: 'Xác nhận & Giao' },
  'Hoàn thành': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Hoàn thành' },
  'Đã hủy': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', label: 'Đã hủy' },
};

export default function AdminOrders() {
  const { confirmAction } = useAdminFeedback();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/admin/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load orders', err);
      showToast('Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  const hasActiveFilter = searchTerm || statusFilter !== 'ALL';

  const performStatusUpdate = async (orderId, newStatus) => {
    const updated = await fetchApi(`/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    setOrders(previous => previous.map(order => order.id === orderId ? { ...order, ...updated, status: newStatus } : order));
    setSelectedOrder(previous => previous?.id === orderId ? { ...previous, ...updated, status: newStatus } : previous);
  };

  const updateStatus = async (orderId, newStatus) => {
    if (updatingId !== null) return;
    setUpdatingId(orderId);
    try {
      await performStatusUpdate(orderId, newStatus);
      showToast(`Đã cập nhật đơn #${orderId}: ${newStatus}.`, 'success');
    } catch (failure) {
      showToast(failure.message || 'Cập nhật trạng thái đơn hàng thất bại.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = (order) => confirmAction({
    title: 'Hủy đơn hàng này?',
    description: 'Đơn hàng sẽ chuyển sang trạng thái đã hủy.',
    resource: `Đơn #${order.id} · ${order.customerName}`,
    note: 'Với đơn COD/BANK, hệ thống sẽ hoàn tồn kho và coupon theo quy tắc của đơn hàng.',
    confirmLabel: 'Hủy đơn hàng',
    pendingLabel: 'Đang hủy…',
    successMessage: `Đã hủy đơn hàng #${order.id}.`,
    onConfirm: () => performStatusUpdate(order.id, 'Đã hủy'),
  });

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = term === '' ||
      o.id.toString().includes(term) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.customerPhone && o.customerPhone.includes(term)) ||
      (o.shippingAddress && o.shippingAddress.toLowerCase().includes(term));
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-orders-page">
      {/* ── HEADER ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Đơn Hàng</h1>
          <p className="dash-subtitle">Theo dõi, xác nhận và cập nhật trạng thái các đơn hàng mua sắm</p>
        </div>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={loadOrders}
          title="Tải lại danh sách"
        >
          <IoRefreshOutline style={{ fontSize: '1.1rem' }} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ── MAIN CARD ── */}
      <div className="admin-card">
        {/* Filter bar */}
        <div className="admin-table-filter-bar">
          <div className="admin-filter-search-box">
            <IoSearchOutline className="filter-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Tên khách hàng, SĐT, Địa chỉ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <IoCloseOutline />
              </button>
            )}
          </div>

          <div className="admin-filter-select-box">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Admin xác nhận & giao">Xác nhận &amp; Giao</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Đã hủy">Đã hủy</option>
            </select>
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="admin-filter-reset-pill"
            >
              <IoCloseOutline style={{ fontSize: '1.1rem' }} />
              <span>Xóa bộ lọc</span>
            </button>
          )}

          <div className="admin-table-count">
            Hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="dash-loading-screen">
            <div className="dash-spinner"></div>
            <span>Đang tải danh sách đơn hàng...</span>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Tổng Tiền</th>
                  <th>Thanh Toán</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const st = STATUS_CONFIG[o.status] || { color: '#64748b', bg: '#f1f5f9', label: o.status };
                  return (
                    <tr key={o.id}>
                      <td>
                        <span className="order-id-badge">#{o.id}</span>
                        <div className="order-time-text">
                          {new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell-name">{o.customerName}</div>
                        <div className="customer-cell-phone">{o.customerPhone}</div>
                        {o.shippingAddress && (
                          <div className="customer-cell-address" title={o.shippingAddress}>
                            {o.shippingAddress}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="order-amount-text">{fmt(o.finalAmount)}</span>
                        {o.discountAmount > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                            Đã giảm: {fmt(o.discountAmount)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="payment-method-pill">{o.paymentMethod || 'COD'}</span>
                      </td>
                      <td>
                        <span
                          className="status-pill"
                          style={{ color: st.color, backgroundColor: st.bg }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="admin-action-btn view"
                            title="Xem chi tiết đơn"
                            onClick={() => setSelectedOrder(o)}
                          >
                            <IoEyeOutline />
                          </button>

                          {o.status === 'Đang xử lý' && (
                            <>
                              <button
                                type="button"
                                className="admin-action-btn approve"
                                title="Xác nhận & Giao hàng"
                                onClick={() => updateStatus(o.id, 'Admin xác nhận & giao')}
                                disabled={updatingId !== null}
                              >
                                <IoCheckmarkOutline />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn danger"
                                title="Hủy đơn hàng"
                                onClick={() => cancelOrder(o)}
                                disabled={updatingId !== null}
                              >
                                <IoCloseOutline />
                              </button>
                            </>
                          )}

                          {o.status === 'Admin xác nhận & giao' && (
                            <>
                              <button
                                type="button"
                                className="admin-action-btn complete"
                                title="Xác nhận đã giao thành công"
                                onClick={() => updateStatus(o.id, 'Hoàn thành')}
                                disabled={updatingId !== null}
                              >
                                <IoCheckmarkDoneOutline />
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn danger"
                                title="Khách từ chối / Hủy đơn"
                                onClick={() => cancelOrder(o)}
                                disabled={updatingId !== null}
                              >
                                <IoCloseOutline />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                      Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL CHI TIẾT ĐƠN HÀNG ── */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IoReceiptOutline style={{ color: 'var(--admin-primary)', fontSize: '1.5rem' }} />
                <div>
                  <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Chi Tiết Đơn Hàng #{selectedOrder.id}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                    Đặt lúc: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                <IoCloseOutline />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Customer info card */}
              <div className="order-detail-meta-box">
                <div className="detail-meta-item">
                  <IoPersonOutline className="detail-meta-icon" />
                  <div>
                    <div className="meta-label">Người nhận</div>
                    <div className="meta-val">{selectedOrder.customerName}</div>
                  </div>
                </div>
                <div className="detail-meta-item">
                  <IoCallOutline className="detail-meta-icon" />
                  <div>
                    <div className="meta-label">Số điện thoại</div>
                    <div className="meta-val">{selectedOrder.customerPhone}</div>
                  </div>
                </div>
                <div className="detail-meta-item">
                  <IoCardOutline className="detail-meta-icon" />
                  <div>
                    <div className="meta-label">Thanh toán</div>
                    <div className="meta-val">{selectedOrder.paymentMethod || 'COD'}</div>
                  </div>
                </div>
                <div className="detail-meta-item" style={{ gridColumn: 'span 3' }}>
                  <IoLocationOutline className="detail-meta-icon" />
                  <div>
                    <div className="meta-label">Địa chỉ nhận hàng</div>
                    <div className="meta-val">{selectedOrder.shippingAddress || 'Nhận tại cửa hàng PhoneZone'}</div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ margin: '16px 0 10px', fontSize: '0.95rem', color: 'var(--admin-text-main)' }}>
                Sản phẩm trong đơn ({selectedOrder.orderItems?.length || 1})
              </h4>
              <div className="order-items-list-box">
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                  selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="order-item-info">
                        <div className="order-item-name">{item.product?.tenSanPham || 'Sản phẩm PhoneZone'}</div>
                        <div className="order-item-qty">Số lượng: {item.quantity} x {fmt(item.unitPrice)}</div>
                      </div>
                      <div className="order-item-total">
                        {fmt((item.quantity || 1) * (item.unitPrice || 0))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="order-item-row">
                    <div className="order-item-info">
                      <div className="order-item-name">Sản phẩm theo đơn hàng #{selectedOrder.id}</div>
                      <div className="order-item-qty">Số lượng: 1</div>
                    </div>
                    <div className="order-item-total">{fmt(selectedOrder.finalAmount)}</div>
                  </div>
                )}
              </div>

              {/* Order financial summary */}
              <div className="order-summary-box">
                <div className="summary-row">
                  <span>Tổng tiền hàng:</span>
                  <span>{fmt(selectedOrder.totalAmount || selectedOrder.finalAmount)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="summary-row discount">
                    <span>Mã giảm giá ưu đãi:</span>
                    <span>-{fmt(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="summary-row final">
                  <span>Tổng thanh toán:</span>
                  <span className="final-price">{fmt(selectedOrder.finalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng
              </button>

              {selectedOrder.status === 'Đang xử lý' && (
                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => updateStatus(selectedOrder.id, 'Admin xác nhận & giao')}
                  disabled={updatingId !== null}
                >
                  <IoCheckmarkOutline style={{ fontSize: '1.1rem' }} />
                  Xác nhận &amp; Giao hàng
                </button>
              )}

              {selectedOrder.status === 'Admin xác nhận & giao' && (
                <button
                  type="button"
                  className="admin-btn-success"
                  onClick={() => updateStatus(selectedOrder.id, 'Hoàn thành')}
                  disabled={updatingId !== null}
                >
                  <IoCheckmarkDoneOutline style={{ fontSize: '1.1rem' }} />
                  Hoàn tất giao hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
