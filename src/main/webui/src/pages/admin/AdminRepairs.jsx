import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';
import {
  IoConstructOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoTrashOutline,
  IoCalendarOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';

const REPAIR_STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#1d6ef5', bg: 'rgba(29, 110, 245, 0.12)' },
  IN_PROGRESS: { label: 'Đang sửa chữa', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  COMPLETED: { label: 'Hoàn thành', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  CANCELLED: { label: 'Đã hủy lịch', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
};

export default function AdminRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadRepairs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/repairs/admin/all?size=100');
      if (data && data.repairs) {
        setRepairs(data.repairs);
      } else if (Array.isArray(data)) {
        setRepairs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetchApi(`/repairs/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadRepairs();
    } catch (e) {
      alert(e.message || 'Cập nhật trạng thái sửa chữa thất bại');
    }
  };

  const deleteRepair = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu sửa chữa này?')) return;
    try {
      await fetchApi(`/repairs/${id}`, { method: 'DELETE' });
      loadRepairs();
    } catch (e) {
      alert(e.message || 'Xóa thất bại');
    }
  };

  const filtered = repairs.filter(r => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = term === '' ||
      (r.customerName && r.customerName.toLowerCase().includes(term)) ||
      (r.customerPhone && r.customerPhone.includes(term)) ||
      (r.deviceModel && r.deviceModel.toLowerCase().includes(term)) ||
      (r.repairService && r.repairService.toLowerCase().includes(term));
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-repairs-page">
      {/* ── HEADER ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Lịch Sửa Chữa</h1>
          <p className="dash-subtitle">Tiếp nhận yêu cầu, cập nhật tiến độ kỹ thuật và lịch hẹn khách hàng</p>
        </div>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={loadRepairs}
          title="Làm mới"
        >
          <IoRefreshOutline style={{ fontSize: '1.1rem' }} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="admin-card">
        {/* Filter bar */}
        <div className="admin-table-filter-bar">
          <div className="admin-filter-search-box">
            <IoSearchOutline className="filter-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo Tên khách, SĐT, Dòng máy, Dịch vụ..."
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
              <option value="ALL">Tất cả trạng thái sửa chữa</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="IN_PROGRESS">Đang sửa chữa</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy lịch</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
              className="admin-filter-reset-pill"
            >
              <IoCloseOutline style={{ fontSize: '1.1rem' }} />
              <span>Xóa lọc</span>
            </button>
          )}

          <div className="admin-table-count">
            Hiển thị <strong>{filtered.length}</strong> / {repairs.length} lịch hẹn
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="dash-loading-screen">
            <div className="dash-spinner"></div>
            <span>Đang tải danh sách lịch sửa chữa...</span>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Phiếu</th>
                  <th>Khách Hàng</th>
                  <th>Thiết Bị &amp; Lỗi</th>
                  <th>Dịch Vụ Sửa</th>
                  <th>Chi Phí (Dự kiến)</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const st = REPAIR_STATUS_MAP[r.status] || { label: r.status, color: '#64748b', bg: '#f1f5f9' };
                  const isUrgent = r.priority === 'URGENT';
                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="order-id-badge">#{r.id}</span>
                        {isUrgent && (
                          <div className="priority-urgent-pill">
                            <IoAlertCircleOutline /> GẤP
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="customer-cell-name">{r.customerName}</div>
                        <div className="customer-cell-phone">{r.customerPhone}</div>
                        {r.appointmentDate && (
                          <div className="order-time-text" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <IoCalendarOutline />
                            Hẹn: {new Date(r.appointmentDate).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>
                          {r.deviceModel || r.deviceType}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '240px', marginTop: '2px' }} title={r.issueDescription}>
                          {r.issueDescription}
                        </div>
                      </td>
                      <td>
                        <span className="repair-service-pill">
                          <IoConstructOutline style={{ marginRight: '4px' }} />
                          {r.repairService}
                        </span>
                      </td>
                      <td>
                        <span className="order-amount-text">
                          {r.estimatedCost ? fmt(r.estimatedCost) : 'Báo giá sau kiểm tra'}
                        </span>
                      </td>
                      <td>
                        <select
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                          className="admin-status-select"
                          style={{ color: st.color, backgroundColor: st.bg, borderColor: st.color }}
                        >
                          <option value="PENDING">Chờ xác nhận</option>
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="IN_PROGRESS">Đang sửa chữa</option>
                          <option value="COMPLETED">Hoàn thành</option>
                          <option value="CANCELLED">Hủy lịch hẹn</option>
                        </select>
                      </td>
                      <td>
                        <div className="admin-actions-cell" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="admin-action-btn danger"
                            onClick={() => deleteRepair(r.id)}
                            title="Xóa phiếu sửa chữa"
                          >
                            <IoTrashOutline />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                      Không tìm thấy lịch hẹn sửa chữa nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
