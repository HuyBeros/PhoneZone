import { useState, useEffect } from 'react';
import { fetchApi } from '../../api/apiClient';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      id: null, username: '', email: '', fullName: '', phone: '', address: '', role: 'ROLE_USER', rewardPoints: 0, newPassword: ''
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
      role: user.role,
      rewardPoints: user.rewardPoints || 0,
      newPassword: '' // Blank, only fill if changing
    });
    setErrorMsg('');
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
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
          return;
        }
        await fetchApi('/admin/users', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      closeModal();
      loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi lưu tài khoản');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      try {
        await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
        loadUsers();
      } catch (err) {
        alert(err.message || 'Xóa thất bại');
      }
    }
  };

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
  };

  const hasActiveFilter = searchTerm || roleFilter !== 'ALL';

  if (loading) {
    return (
      <div className="dash-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Đang tải danh sách người dùng...</span>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchRole = roleFilter === 'ALL' || user.role === roleFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch = term === '' || 
      user.id.toString().includes(term) || 
      (user.username && user.username.toLowerCase().includes(term)) ||
      (user.fullName && user.fullName.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.phone && user.phone.includes(term));
    return matchRole && matchSearch;
  });

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-title">Quản Lý Tài Khoản</h1>
          <p className="dash-subtitle">Xem, thêm, sửa, xóa người dùng hệ thống</p>
        </div>
        <button className="dash-view-all-btn" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Thêm Tài Khoản
        </button>
      </div>

      <div className="admin-card">
        <div style={{padding: '16px', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="Tìm theo ID, Tên, Username, Email, SĐT..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{padding: '10px 14px', flex: '1', minWidth: '250px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          />

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', outline: 'none', background: 'var(--admin-bg)', color: 'var(--admin-text-main)'}}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ROLE_USER">Khách hàng</option>
            <option value="ROLE_ADMIN">Quản trị viên</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={handleResetFilters}
              style={{padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap'}}
            >
              <i className="fas fa-times" style={{marginRight: '6px'}}></i>Xóa lọc
            </button>
          )}

          <span style={{fontSize: '0.85rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto'}}>
            {filteredUsers.length} / {users.length} tài khoản
          </span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thông Tin</th>
              <th>Liên Hệ</th>
              <th>Vai Trò</th>
              <th>Điểm</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>
                  <div className="user-cell">
                    <div className="admin-profile-avatar" style={{width: 32, height: 32, fontSize: '0.8rem', background: user.role === 'ROLE_ADMIN' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#94a3b8', border: 'none', color: '#fff'}}>
                      {(user.fullName || user.username).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight: 700, color: 'var(--admin-text-main)'}}>{user.fullName || user.username}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--admin-text-muted)'}}>@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{fontSize: '0.85rem'}}>{user.email || <span style={{opacity: 0.5}}>Chưa có email</span>}</div>
                  <div style={{fontSize: '0.85rem'}}>{user.phone || <span style={{opacity: 0.5}}>Chưa có SDT</span>}</div>
                </td>
                <td>
                  <span className="status-badge" style={{
                    background: user.role === 'ROLE_ADMIN' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                    color: user.role === 'ROLE_ADMIN' ? '#6366f1' : '#10b981'
                  }}>
                    {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Khách hàng'}
                  </span>
                </td>
                <td style={{fontWeight: 600, color: 'var(--admin-orange)'}}>{user.rewardPoints || 0}</td>
                <td>
                  <button onClick={() => openEditModal(user)} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '5px 10px', fontSize: '1rem'}} title="Sửa">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(user.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px 10px', fontSize: '1rem'}} title="Xóa">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)'}}>
                  Không tìm thấy tài khoản nào phù hợp.
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
              <h2>{isEditMode ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản'}</h2>
              <button className="admin-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              {errorMsg && <div className="admin-alert error">{errorMsg}</div>}
              
              <div className="form-group-grid">
                <div className="form-group">
                  <label>Tên đăng nhập *</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} required disabled={isEditMode} />
                  {isEditMode && <span style={{fontSize: '0.75rem', color: '#f59e0b'}}>* Không thể đổi tên đăng nhập</span>}
                </div>
                <div className="form-group">
                  <label>Mật khẩu {isEditMode ? '(Bỏ trống nếu không đổi)' : '*'}</label>
                  <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group-grid">
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}>
                    <option value="ROLE_USER">Khách hàng</option>
                    <option value="ROLE_ADMIN">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Điểm thưởng</label>
                <input type="number" name="rewardPoints" value={formData.rewardPoints} onChange={handleInputChange} min="0" />
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="admin-btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
