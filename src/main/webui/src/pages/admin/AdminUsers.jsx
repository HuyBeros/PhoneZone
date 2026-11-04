import { useAdminFeedback } from '../../store/AdminFeedbackContext';
import { useToast } from '../../store/ToastContext';
import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';
import {
  IoPeopleOutline,
  IoPersonAddOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoStarOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

export default function AdminUsers() {
  const { confirmAction } = useAdminFeedback();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    username: '',
    email: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'ROLE_USER',
    rewardPoints: 0,
    newPassword: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Không thể tải danh sách tài khoản. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAddModal = () => {
    setFormData({
      id: null,
      username: '',
      email: '',
      fullName: '',
      phone: '',
      address: '',
      role: 'ROLE_USER',
      rewardPoints: 0,
      newPassword: ''
    });
    setErrorMsg('');
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email || '',
      fullName: user.fullName || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'ROLE_USER',
      rewardPoints: user.rewardPoints || 0,
      newPassword: ''
    });
    setErrorMsg('');
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorMsg('');
    try {
      if (isEditMode) {
        await fetchApi(`/admin/users/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        if (!formData.newPassword) {
          setErrorMsg('Vui lòng nhập mật khẩu cho tài khoản mới');
          setSaving(false);
          return;
        }
        await fetchApi('/admin/users', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      loadUsers();
      showToast(isEditMode ? 'Đã cập nhật tài khoản.' : 'Đã thêm tài khoản.', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu tài khoản');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    const item = users.find(entry => entry.id === id);
    return confirmAction({
      title: 'Xóa tài khoản này?',
      description: 'Kiểm tra thông tin bên dưới trước khi xác nhận xóa.',
      resource: item?.username || `#${id}`,
      note: 'Thao tác xóa không thể hoàn tác.',
      confirmLabel: 'Xóa tài khoản',
      successMessage: 'Đã xóa tài khoản.',
      onConfirm: async () => {
        await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
        setUsers(previous => previous.filter(entry => entry.id !== id));
      },
    });
  };

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch = term === '' ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term));
    return matchRole && matchSearch;
  });

  return (
    <div className="admin-users-page">
      {/* ── HEADER ── */}
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Tài Khoản</h1>
          <p className="dash-subtitle">Quản trị người dùng, phân quyền quản trị viên và điểm thưởng PhoneZone</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={loadUsers}
            title="Làm mới"
          >
            <IoRefreshOutline style={{ fontSize: '1.1rem' }} />
            <span>Làm mới</span>
          </button>
          <button className="dash-view-all-btn" onClick={openAddModal}>
            <IoPersonAddOutline style={{ fontSize: '1.15rem' }} />
            <span>Thêm Tài Khoản</span>
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
              placeholder="Tìm theo Username, Họ tên, Email, SĐT..."
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
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
              <option value="ROLE_USER">Khách hàng (USER)</option>
            </select>
          </div>

          {(searchTerm || roleFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setRoleFilter('ALL'); }}
              className="admin-filter-reset-pill"
            >
              <IoCloseOutline style={{ fontSize: '1.1rem' }} />
              <span>Xóa lọc</span>
            </button>
          )}

          <div className="admin-table-count">
            Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} tài khoản
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="dash-loading-screen">
            <div className="dash-spinner"></div>
            <span>Đang tải danh sách người dùng...</span>
          </div>
        ) : (
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tài Khoản</th>
                  <th>Họ và Tên</th>
                  <th>Liên Hệ</th>
                  <th>Vai Trò</th>
                  <th>Điểm Thưởng</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isAdmin = u.role === 'ROLE_ADMIN';
                  const initial = (u.fullName || u.username || 'U').charAt(0).toUpperCase();
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="user-table-cell">
                          <div className={`user-avatar-badge ${isAdmin ? 'admin' : ''}`}>
                            {initial}
                          </div>
                          <div>
                            <div className="user-username">@{u.username}</div>
                            <div className="user-id-sub">ID: #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>
                          {u.fullName || 'Chưa cập nhật'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{u.email || '-'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>{u.phone || '-'}</div>
                      </td>
                      <td>
                        <span className={`status-pill ${isAdmin ? 'admin-role' : 'user-role'}`}>
                          {isAdmin ? (
                            <>
                              <IoShieldCheckmarkOutline style={{ marginRight: '4px' }} />
                              Quản trị viên
                            </>
                          ) : (
                            'Khách hàng'
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="reward-points-badge">
                          <IoStarOutline style={{ color: '#eab308' }} />
                          <span>{u.rewardPoints || 0} pts</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions-cell" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="admin-action-btn edit"
                            onClick={() => openEditModal(u)}
                            title="Sửa thông tin"
                          >
                            <IoCreateOutline />
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn danger"
                            onClick={() => handleDelete(u.id, u.username)}
                            title="Xóa người dùng"
                          >
                            <IoTrashOutline />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--admin-text-muted)' }}>
                      Không tìm thấy tài khoản nào phù hợp.
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
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IoPeopleOutline style={{ color: 'var(--admin-primary)', fontSize: '1.4rem' }} />
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{isEditMode ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}</h2>
              </div>
              <button type="button" className="admin-modal-close" onClick={closeModal}>
                <IoCloseOutline />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              {errorMsg && <div className="admin-alert error">{errorMsg}</div>}

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Tên Đăng Nhập (Username) *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isEditMode}
                    placeholder="VD: nguyenvanan"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{isEditMode ? 'Mật Khẩu Mới (Bỏ trống nếu không đổi)' : 'Mật Khẩu *'}</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Ít nhất 6 ký tự"
                    required={!isEditMode}
                  />
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="VD: Nguyễn Văn An"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="VD: an.nguyen@gmail.com"
                  />
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Số Điện Thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="VD: 0988123456"
                  />
                </div>
                <div className="form-group">
                  <label>Vai Trò Hệ Thống</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="ROLE_USER">Khách hàng thông thường (ROLE_USER)</option>
                    <option value="ROLE_ADMIN">Quản trị viên hệ thống (ROLE_ADMIN)</option>
                  </select>
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Điểm Thưởng Tích Lũy</label>
                  <input
                    type="number"
                    name="rewardPoints"
                    value={formData.rewardPoints}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Địa Chỉ Thường Trú</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="VD: 123 Đường Cầu Diễn, Hà Nội"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving} aria-busy={saving}>
                  {saving ? <><IoRefreshOutline className="admin-action-spinner" /> Đang lưu…</> : <>
                  <IoCheckmarkCircleOutline style={{ fontSize: '1.1rem' }} />
                  {isEditMode ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
