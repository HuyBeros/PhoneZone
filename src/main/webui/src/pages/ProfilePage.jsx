import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    gender: 'male',
    dob: '1995-05-15',
  });

  const [addresses, setAddresses] = useState([
    { id: 1, name: 'Nhà riêng', address: '123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội', isDefault: true },
    { id: 2, name: 'Công ty', address: 'Tòa nhà Keangnam, Nam Từ Liêm, Hà Nội', isDefault: false }
  ]);

  const handleSave = (e) => {
    e.preventDefault();
    alert('✅ Cập nhật thông tin thành công!');
  };

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
              <div className="ps-avatar">NV</div>
              <div className="ps-info">
                <strong>{profile.name}</strong>
                <span>Thành viên Bạc</span>
              </div>
            </div>
            <nav className="ps-nav">
              <Link to="/profile" className="active"><i className="fa fa-user"></i> Hồ sơ của tôi</Link>
              <Link to="/orders"><i className="fa fa-box"></i> Đơn hàng mua</Link>
              <Link to="/rewards"><i className="fa fa-star"></i> Điểm & Coupon</Link>
              <button className="ps-logout"><i className="fa fa-sign-out-alt"></i> Đăng xuất</button>
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
