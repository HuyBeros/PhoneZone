import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';
import {
  IoTicketOutline,
  IoAddOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoStarOutline
} from 'react-icons/io5';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [formData, setFormData] = useState({
    id: null,
    code: '',
    discountAmount: 0,
    pointsRequired: 0,
    description: '',
    isActive: true
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/coupons');
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openAddModal = () => {
    setFormData({
      id: null,
      code: '',
      discountAmount: 0,
      pointsRequired: 0,
      description: '',
      isActive: true
    });
    setErrorMsg('');
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setFormData({
      id: c.id,
      code: c.code || '',
      discountAmount: c.discountAmount || 0,
      pointsRequired: c.pointsRequired || 0,
      description: c.description || '',
      isActive: c.isActive !== false
    });
    setErrorMsg('');
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (isEditMode) {
        await fetchApi(`/admin/coupons/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await fetchApi('/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu mã giảm giá');
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã "${code}"?`)) {
      try {
        await fetchApi(`/admin/coupons/${id}`, { method: 'DELETE' });
        loadCoupons();
      } catch (err) {
        alert(err.message || 'Xóa thất bại');
      }
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.isActive !== false) ||
      (statusFilter === 'INACTIVE' && c.isActive === false);
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = term === '' ||
      (c.code && c.code.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term));
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-coupons-page">
      {/* ── HEADER ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Mã Khuyến Mãi</h1>
          <p className="dash-subtitle">Tạo và cấu hình coupon giảm giá, voucher đổi điểm thưởng PhoneZone</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={loadCoupons}
            title="Làm mới"
          >
            <IoRefreshOutline style={{ fontSize: '1.1rem' }} />
            <span>Làm mới</span>
          </button>
          <button className="dash-view-all-btn" onClick={openAddModal}>
            <IoAddOutline style={{ fontSize: '1.25rem' }} />
            <span>Thêm Mã Mới</span>
          </button>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter bar */}
        <div className="admin-table-filter-bar">
          <div className="admin-filter-search-box">
            <IoSearchOutline className="filter-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo Mã coupon, mô tả..."
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
              <option value="ACTIVE">Đang áp dụng</option>
              <option value="INACTIVE">Đã khóa</option>
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
            Hiển thị <strong>{filteredCoupons.length}</strong> / {coupons.length} mã ưu đãi
          </div>
        </div>

        {/* Coupons Table */}
        {loading ? (
          <div className="dash-loading-screen">
            <div className="dash-spinner"></div>
            <span>Đang tải danh sách coupon...</span>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã Coupon</th>
                  <th>Mức Giảm Giá</th>
                  <th>Điểm Yêu Cầu</th>
                  <th>Mô Tả Ưu Đãi</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="coupon-code-cell">
                        <IoTicketOutline style={{ color: 'var(--admin-primary)', fontSize: '1.2rem' }} />
                        <span className="coupon-code-badge">{c.code}</span>
                      </div>
                    </td>
                    <td>
                      <span className="order-amount-text">{fmt(c.discountAmount)}</span>
                    </td>
                    <td>
                      <div className="reward-points-badge">
                        <IoStarOutline style={{ color: '#eab308' }} />
                        <span>{c.pointsRequired ? `${c.pointsRequired} điểm` : 'Miễn phí'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px', fontSize: '0.85rem', color: 'var(--admin-text-main)' }}>
                        {c.description || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${c.isActive !== false ? 'active' : 'inactive'}`}>
                        {c.isActive !== false ? 'Đang kích hoạt' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions-cell" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="admin-action-btn edit"
                          onClick={() => openEditModal(c)}
                          title="Sửa coupon"
                        >
                          <IoCreateOutline />
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn danger"
                          onClick={() => handleDelete(c.id, c.code)}
                          title="Xóa coupon"
                        >
                          <IoTrashOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCoupons.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                      Không tìm thấy mã khuyến mãi nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IoTicketOutline style={{ color: 'var(--admin-primary)', fontSize: '1.4rem' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditMode ? 'Sửa Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}</h2>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                <IoCloseOutline />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Mã Code (In hoa, viết liền) *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().trim() }))}
                    placeholder="VD: PZ100K, SALE50"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mức Giảm Giá (VND) *</label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    min="1000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Số Điểm PhoneZone Rewards Cần Đổi</label>
                <input
                  type="number"
                  name="pointsRequired"
                  value={formData.pointsRequired}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0 nếu là mã công khai cho tất cả"
                />
              </div>

              <div className="form-group">
                <label>Mô Tả / Điều Kiện Áp Dụng</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="VD: Giảm ngay 100.000đ cho đơn hàng điện thoại từ 5 triệu..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-checkbox-row">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="couponIsActive"
                />
                <label htmlFor="couponIsActive">
                  Kích hoạt mã (Cho phép khách hàng nhìn thấy và đổi thưởng)
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary">
                  <IoCheckmarkCircleOutline style={{ fontSize: '1.1rem' }} />
                  {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
