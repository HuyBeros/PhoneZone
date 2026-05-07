import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [profile, setProfile] = useState({
    name: user?.fullName || user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: 'male',
    dob: '1990-01-01',
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.fullName || user.username || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const [addresses, setAddresses] = useState([
    { id: 1, name: 'Nhà riêng', address: '123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội', isDefault: true },
    { id: 2, name: 'Công ty', address: 'Tòa nhà Keangnam, Nam Từ Liêm, Hà Nội', isDefault: false }
  ]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { fetchApi } = await import('../api/apiClient');
      const res = await fetchApi('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: profile.name,
          phone: profile.phone
        })
      });
      if (res && res.user) {
        setUser(res.user);
        alert('✅ Cập nhật thông tin thành công!');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      alert('❌ Lỗi cập nhật: ' + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fa fa-home"></i> Trang chủ</Link>
          <span className="sep"><i className="fa fa-chevron-right"></i></span>
          <span>Tài khoản của tôi</span>
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
              <Link to="/profile" className="active"><i className="fa fa-user"></i> Hồ sơ của tôi</Link>
              <Link to="/orders"><i className="fa fa-box"></i> Đơn hàng mua</Link>
              <Link to="/rewards"><i className="fa fa-star"></i> Điểm & Coupon</Link>
              <button className="ps-logout" onClick={handleLogout}><i className="fa fa-sign-out-alt"></i> Đăng xuất</button>
            </nav>
          </div>

          <div className="profile-content">
            <h2 className="pc-title">Hồ sơ của tôi</h2>
            <p className="pc-subtitle">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

            <form className="profile-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profile.email} disabled />
                <span className="form-hint">Email không thể thay đổi</span>
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Giới tính</label>
                <div className="radio-group">
                  <label><input type="radio" name="gender" checked={profile.gender === 'male'} onChange={() => setProfile({...profile, gender: 'male'})} /> Nam</label>
                  <label><input type="radio" name="gender" checked={profile.gender === 'female'} onChange={() => setProfile({...profile, gender: 'female'})} /> Nữ</label>
                  <label><input type="radio" name="gender" checked={profile.gender === 'other'} onChange={() => setProfile({...profile, gender: 'other'})} /> Khác</label>
                </div>
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <input type="date" value={profile.dob} onChange={e => setProfile({...profile, dob: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
            </form>

            <div className="address-section">
              <div className="address-header">
                <h3>Sổ địa chỉ</h3>
                <button className="btn btn-outline btn-sm"><i className="fa fa-plus"></i> Thêm địa chỉ mới</button>
              </div>
              <div className="address-list">
                {addresses.map(a => (
                  <div key={a.id} className="address-card">
                    <div className="ac-left">
                      <div className="ac-name">
                        <strong>{a.name}</strong> 
                        {a.isDefault && <span className="ac-default-tag">Mặc định</span>}
                      </div>
                      <div className="ac-text">{a.address}</div>
                    </div>
                    <div className="ac-actions">
                      <button className="btn-link">Sửa</button>
                      {!a.isDefault && <button className="btn-link text-danger">Xóa</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
