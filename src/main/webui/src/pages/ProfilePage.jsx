import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import { fetchApi } from '../api/apiClient';

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

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

  // Password change state
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showPwFields, setShowPwFields] = useState({ current: false, new: false, confirm: false });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          fullName: profile.name,
          phone: profile.phone
        })
      });
      if (res && res.user) {
        setUser(res.user);
        showToast('Cập nhật thông tin thành công!', 'success');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      showToast('Lỗi cập nhật: ' + err.message, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);

    if (!pwForm.currentPassword) {
      setPwError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwError('Mật khẩu mới phải khác mật khẩu hiện tại');
      return;
    }

    setPwLoading(true);
    try {
      await fetchApi('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
          confirmPassword: pwForm.confirmPassword,
        })
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Đổi mật khẩu thành công!', 'success');
    } catch (err) {
      setPwError(err.message || 'Có lỗi xảy ra');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Quá ngắn', color: '#ef4444', width: '20%' };
    if (password.length < 8) return { label: 'Yếu', color: '#f59e0b', width: '40%' };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score === 3) return { label: 'Mạnh', color: '#10b981', width: '100%' };
    if (score === 2) return { label: 'Khá', color: '#3b82f6', width: '70%' };
    return { label: 'Trung bình', color: '#f59e0b', width: '50%' };
  };

  const pwStrength = getPasswordStrength(pwForm.newPassword);

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fas fa-house"></i> Trang chủ</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
          <span>Tài khoản của tôi</span>
        </div>

        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="ps-user">
              <div className="ps-avatar">{(user.fullName || user.username).charAt(0).toUpperCase()}</div>
              <div className="ps-info">
                <strong>{user.fullName || user.username}</strong>
                <span>Thành viên PhoneZone</span>
              </div>
            </div>
            <nav className="ps-nav">
              <Link to="/profile" className="active"><i className="fas fa-user"></i> Hồ sơ của tôi</Link>
              <Link to="/orders"><i className="fas fa-box"></i> Đơn hàng mua</Link>
              <Link to="/rewards"><i className="fas fa-star"></i> Điểm &amp; Coupon</Link>
              <button className="ps-logout" onClick={handleLogout}><i className="fas fa-right-from-bracket"></i> Đăng xuất</button>
            </nav>
          </div>

          {/* Content */}
          <div className="profile-content">

            {/* ── Section 1: Thông tin hồ sơ ── */}
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
                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
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

            {/* ── Section 2: Đổi mật khẩu ── */}
            <div style={{
              marginTop: '40px',
              borderTop: '1px solid var(--border)',
              paddingTop: '32px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px'}}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f97316, #ef4444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem'
                }}>
                  <i className="fas fa-lock"></i>
                </div>
                <h2 className="pc-title" style={{marginBottom: 0}}>Đổi Mật Khẩu</h2>
              </div>
              <p className="pc-subtitle">Bảo vệ tài khoản bằng mật khẩu mạnh</p>

              <form className="profile-form" onSubmit={handleChangePassword} autoComplete="off">

                {/* Alert thành công */}
                {pwSuccess && (
                  <div style={{
                    padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                  }}>
                    <i className="fas fa-check-circle"></i>
                    Đổi mật khẩu thành công!
                  </div>
                )}

                {/* Alert lỗi */}
                {pwError && (
                  <div style={{
                    padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                  }}>
                    <i className="fas fa-exclamation-circle"></i>
                    {pwError}
                  </div>
                )}

                {/* Mật khẩu hiện tại */}
                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPwFields.current ? 'text' : 'password'}
                      value={pwForm.currentPassword}
                      onChange={e => { setPwForm({...pwForm, currentPassword: e.target.value}); setPwError(''); setPwSuccess(false); }}
                      placeholder="Nhập mật khẩu hiện tại"
                      autoComplete="current-password"
                      style={{paddingRight: '44px'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwFields(p => ({...p, current: !p.current}))}
                      style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem', padding: '4px'}}
                    >
                      <i className={`fas ${showPwFields.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPwFields.new ? 'text' : 'password'}
                      value={pwForm.newPassword}
                      onChange={e => { setPwForm({...pwForm, newPassword: e.target.value}); setPwError(''); setPwSuccess(false); }}
                      placeholder="Ít nhất 6 ký tự"
                      autoComplete="new-password"
                      style={{paddingRight: '44px'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwFields(p => ({...p, new: !p.new}))}
                      style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem', padding: '4px'}}
                    >
                      <i className={`fas ${showPwFields.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {pwForm.newPassword && pwStrength && (
                    <div style={{marginTop: '8px'}}>
                      <div style={{height: '4px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden'}}>
                        <div style={{
                          height: '100%', width: pwStrength.width,
                          background: pwStrength.color,
                          borderRadius: '4px', transition: 'all 0.3s ease'
                        }} />
                      </div>
                      <span style={{fontSize: '0.75rem', color: pwStrength.color, marginTop: '4px', display: 'block'}}>
                        <i className="fas fa-shield-alt" style={{marginRight: '4px'}}></i>
                        Độ mạnh: {pwStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <div style={{position: 'relative'}}>
                    <input
                      type={showPwFields.confirm ? 'text' : 'password'}
                      value={pwForm.confirmPassword}
                      onChange={e => { setPwForm({...pwForm, confirmPassword: e.target.value}); setPwError(''); setPwSuccess(false); }}
                      placeholder="Nhập lại mật khẩu mới"
                      autoComplete="new-password"
                      style={{
                        paddingRight: '44px',
                        borderColor: pwForm.confirmPassword
                          ? (pwForm.confirmPassword === pwForm.newPassword ? '#10b981' : '#ef4444')
                          : undefined
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwFields(p => ({...p, confirm: !p.confirm}))}
                      style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem', padding: '4px'}}
                    >
                      <i className={`fas ${showPwFields.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    {pwForm.confirmPassword && (
                      <i
                        className={`fas ${pwForm.confirmPassword === pwForm.newPassword ? 'fa-check-circle' : 'fa-times-circle'}`}
                        style={{
                          position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)',
                          color: pwForm.confirmPassword === pwForm.newPassword ? '#10b981' : '#ef4444',
                          fontSize: '0.9rem'
                        }}
                      />
                    )}
                  </div>
                  {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                    <span style={{fontSize: '0.78rem', color: '#ef4444', marginTop: '4px', display: 'block'}}>
                      Mật khẩu xác nhận không khớp
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pwLoading}
                  style={{opacity: pwLoading ? 0.7 : 1}}
                >
                  {pwLoading ? (
                    <><i className="fas fa-spinner fa-spin" style={{marginRight: '8px'}}></i>Đang xử lý...</>
                  ) : (
                    <><i className="fas fa-key" style={{marginRight: '8px'}}></i>Đổi Mật Khẩu</>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
