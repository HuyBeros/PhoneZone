import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';
import { fmt } from '../../utils/utils';

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

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/coupons');
      setCoupons(data || []);
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      id: null, code: '', discountAmount: 0, pointsRequired: 0, description: '', isActive: true
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
      setErrorMsg(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
      try {
        await fetchApi(`/admin/coupons/${id}`, { method: 'DELETE' });
        loadCoupons();
      } catch (err) {
        alert(err.message || 'Xóa thất bại');
      }
    }
  };

  // Lọc coupon
  const filteredCoupons = coupons.filter(c => {
    const term = searchTerm.trim().toLowerCase();
    const matchSearch = term === '' ||
      (c.code && c.code.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      (c.id && c.id.toString().includes(term));
    const matchStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.isActive !== false) ||
      (statusFilter === 'INACTIVE' && c.isActive === false);
    return matchSearch && matchStatus;
  });

  const hasActiveFilter = searchTerm || statusFilter !== 'ALL';

  if (loading) {
    return (
      <div className="dash-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Đang tải khuyến mãi...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Khuyến Mãi</h1>
          <p className="dash-subtitle">Tạo và quản lý các mã giảm giá (Coupons)</p>
        </div>
        <button className="dash-view-all-btn" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Tạo Mã Khuyến Mãi
        </button>
      </div>

      <div className="admin-card">
        {/* Filter Bar */}
        <div style={{padding: '16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="Tìm theo mã, mô tả, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{padding: '10px 14px', flex: '1', minWidth: '220px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          />

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang kích hoạt</option>
            <option value="INACTIVE">Vô hiệu hóa</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
              style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap'}}
            >
              <i className="fas fa-times" style={{marginRight: '6px'}}></i>Xóa lọc
            </button>
          )}

          <span style={{fontSize: '0.85rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto'}}>
            {filteredCoupons.length} / {coupons.length} mã
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã Khuyến Mãi</th>
              <th>Giảm Giá</th>
              <th>Điểm Yêu Cầu</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map(c => (
              <tr key={c.id}>
                <td>#{c.id}</td>
                <td>
                  <div style={{fontWeight: 700, color: 'var(--admin-text-main)', letterSpacing: '1px'}}>{c.code}</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)'}}>{c.description || 'Không có mô tả'}</div>
                </td>
                <td style={{fontWeight: 700, color: '#ef4444'}}>-{fmt(c.discountAmount)}</td>
                <td style={{fontWeight: 600, color: 'var(--admin-orange)'}}>
                  <i className="fas fa-star" style={{fontSize: '0.75rem', marginRight: '4px'}}></i>{c.pointsRequired}
                </td>
                <td>
                  <span className="status-badge" style={{background: c.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: c.isActive ? '#10b981' : '#ef4444'}}>
                    {c.isActive ? 'Đang kích hoạt' : 'Vô hiệu hóa'}
                  </span>
                </td>
                <td>
                  <button onClick={() => openEditModal(c)} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '5px', fontSize: '1rem'}} title="Sửa">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px', fontSize: '1rem'}} title="Xóa">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredCoupons.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)'}}>
                  {hasActiveFilter ? 'Không tìm thấy mã nào phù hợp.' : 'Chưa có mã khuyến mãi nào.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h2>{isEditMode ? 'Sửa Mã Khuyến Mãi' : 'Thêm Mã Khuyến Mãi'}</h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

              <div className="form-group">
                <label>Mã Khuyến Mãi (CODE) *</label>
                <input type="text" name="code" value={formData.code} onChange={handleInputChange} style={{textTransform: 'uppercase'}} required />
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Số Tiền Giảm (VND) *</label>
                  <input type="number" name="discountAmount" value={formData.discountAmount} onChange={handleInputChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Điểm Cần Để Đổi *</label>
                  <input type="number" name="pointsRequired" value={formData.pointsRequired} onChange={handleInputChange} required min="0" />
                </div>
              </div>

              <div className="form-group">
                <label>Mô Tả</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="VD: Giảm giá ngày nhà giáo..." />
              </div>

              <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} id="isActiveCoupon" style={{width: 'auto'}} />
                <label htmlFor="isActiveCoupon" style={{marginBottom: 0, textTransform: 'none', fontSize: '0.9rem', color: 'var(--admin-text-main)'}}>Kích hoạt mã này (Cho phép sử dụng)</label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="admin-btn-primary">Lưu Mã</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
