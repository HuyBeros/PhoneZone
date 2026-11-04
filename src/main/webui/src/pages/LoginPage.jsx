import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';
import {
  IoPhonePortraitOutline,
  IoSparkles,
  IoPersonOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowBackOutline,
  IoLogInOutline,
  IoPersonAddOutline,
  IoReloadOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoMailOutline,
  IoCallOutline,
} from 'react-icons/io5';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState(location.state?.tab || 'login');

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(location.state?.sessionExpired
    ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    : '');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const [regForm, setRegForm] = useState({ username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const from = location.state?.from || '/';
  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginForm.username.trim(), loginForm.password);
      showToast('Đăng nhập thành công! Chào mừng bạn trở lại.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Sai tên đăng nhập hoặc mật khẩu.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!regForm.fullName.trim()) return setRegError('Vui lòng nhập họ tên.');
    if (regForm.username.trim().length < 3) return setRegError('Tên đăng nhập phải ít nhất 3 ký tự.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) return setRegError('Email không hợp lệ.');
    if (regForm.password.length < 6) return setRegError('Mật khẩu phải ít nhất 6 ký tự.');
    if (regForm.password !== regForm.confirmPassword) return setRegError('Mật khẩu xác nhận không khớp.');
    setRegLoading(true);
    try {
      await register({
        username: regForm.username.trim(),
        email: regForm.email.trim(),
        password: regForm.password,
        fullName: regForm.fullName.trim(),
        phone: regForm.phone.trim(),
      });
      setRegSuccess(true);
      showToast('Tạo tài khoản thành công! Đang chuyển sang đăng nhập...', 'success');
      setTimeout(() => {
        setTab('login');
        setLoginForm({ username: regForm.username.trim(), password: '' });
        setRegSuccess(false);
      }, 1500);
    } catch (err) {
      setRegError(err.message || 'Đăng ký thất bại. Tên đăng nhập hoặc email có thể đã tồn tại.');
    } finally {
      setRegLoading(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { label: 'Yếu', color: '#ef4444', width: '30%' };
    if (score <= 4) return { label: 'Trung bình', color: '#f59e0b', width: '65%' };
    return { label: 'Mạnh', color: '#10b981', width: '100%' };
  };

  const strength = getPasswordStrength(regForm.password);

  return (
    <div className="auth-page">
      {/* Nền hiệu ứng nhẹ */}
      <div className="auth-bg">
        <div className="auth-bg-blob auth-bg-blob-1"></div>
        <div className="auth-bg-blob auth-bg-blob-2"></div>
      </div>

      <div className="auth-container">

        {/* ── BANNER TRÁI (Thiết kế đơn giản, ít thông tin & tinh tế) ── */}
        <div className="auth-left">
          <div className="auth-ring auth-ring-1"></div>
          <div className="auth-ring auth-ring-2"></div>

          {/* Logo PhoneZone */}
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <IoPhonePortraitOutline style={{ fontSize: '1.25rem' }} />
            </div>
            <span>PhoneZone</span>
          </Link>

          {/* Thông điệp chính ngắn gọn, tinh tế */}
          <div className="auth-left-body">
            <div className="auth-badge-pill">
              <IoSparkles style={{ color: '#38bdf8', marginRight: 6 }} />
              <span>Chính hãng 100%</span>
            </div>

            <h2 className="auth-left-title">
              Thế giới công nghệ<br />
              <span className="auth-title-gradient">chính hãng đỉnh cao.</span>
            </h2>

            <p className="auth-left-sub">
              Trải nghiệm mua sắm tiện lợi, quản lý đơn hàng thông minh và nhận trọn vẹn đặc quyền ưu đãi tại PhoneZone.
            </p>
          </div>

          {/* 3 cam kết nhỏ gọn ở chân banner */}
          <div className="auth-commit-pills">
            <span className="auth-commit-item">✓ Giao nhanh 2h</span>
            <span className="auth-commit-item">✓ Đổi trả 30 ngày</span>
            <span className="auth-commit-item">✓ Trả góp 0%</span>
          </div>
        </div>

        {/* ── FORM PHẢI (Đăng nhập / Đăng ký) ── */}
        <div className="auth-right">
          <div className="auth-right-top">
            <Link to="/" className="auth-back-link">
              <IoArrowBackOutline style={{ fontSize: '1.05rem' }} />
              <span>Về trang chủ</span>
            </Link>
          </div>

          {/* Tab buttons */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setLoginError(''); }}
            >
              <IoLogInOutline style={{ fontSize: '1.1rem' }} />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'register'}
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setRegError(''); }}
            >
              <IoPersonAddOutline style={{ fontSize: '1.1rem' }} />
              <span>Đăng ký</span>
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="auth-form-header">
                <h3>Đăng nhập</h3>
                <p>Chào mừng bạn trở lại với PhoneZone</p>
              </div>

              {loginError && (
                <div className="auth-alert auth-alert-error">
                  <IoAlertCircleOutline style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="login-username">Tên đăng nhập</label>
                <div className="auth-input-wrap">
                  <IoPersonOutline className="auth-input-icon" />
                  <input
                    id="login-username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={loginForm.username}
                    onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Mật khẩu</label>
                <div className="auth-input-wrap">
                  <IoLockClosedOutline className="auth-input-icon" />
                  <input
                    id="login-password"
                    type={showLoginPwd ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={loginForm.password}
                    onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-pwd-toggle"
                    onClick={() => setShowLoginPwd(p => !p)}
                    tabIndex={-1}
                    aria-label={showLoginPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showLoginPwd ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <IoReloadOutline className="fa-spin" style={{ marginRight: 6 }} />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <IoLogInOutline style={{ fontSize: '1.2rem', marginRight: 6 }} />
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>

              <p className="auth-switch-hint">
                Chưa có tài khoản?{' '}
                <button type="button" className="auth-link-btn" onClick={() => setTab('register')}>
                  Đăng ký tài khoản mới
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form className="auth-form" onSubmit={handleRegister} noValidate>
              <div className="auth-form-header">
                <h3>Tạo tài khoản</h3>
                <p>Bắt đầu hành trình mua sắm cùng PhoneZone</p>
              </div>

              {regError && (
                <div className="auth-alert auth-alert-error">
                  <IoAlertCircleOutline style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="auth-alert auth-alert-success">
                  <IoCheckmarkCircleOutline style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                  <span>Đăng ký thành công! Đang chuyển sang đăng nhập...</span>
                </div>
              )}

              <div className="auth-field-row">
                <div className="auth-field">
                  <label htmlFor="reg-fullname">
                    Họ và tên <span className="auth-required">*</span>
                  </label>
                  <div className="auth-input-wrap">
                    <IoPersonOutline className="auth-input-icon" />
                    <input
                      id="reg-fullname"
                      maxLength={100}
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={regForm.fullName}
                      onChange={e => setRegForm(p => ({ ...p, fullName: e.target.value }))}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="reg-phone">Số điện thoại</label>
                  <div className="auth-input-wrap">
                    <IoCallOutline className="auth-input-icon" />
                    <input
                      id="reg-phone"
                      maxLength={20}
                      type="tel"
                      placeholder="0912 345 678"
                      value={regForm.phone}
                      onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))}
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-username">
                  Tên đăng nhập <span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <IoPersonOutline className="auth-input-icon" />
                  <input
                    id="reg-username"
                    maxLength={50}
                    type="text"
                    placeholder="Tối thiểu 3 ký tự"
                    value={regForm.username}
                    onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-email">
                  Email <span className="auth-required">*</span>
                </label>
                <div className="auth-input-wrap">
                  <IoMailOutline className="auth-input-icon" />
                  <input
                    id="reg-email"
                    maxLength={100}
                    type="email"
                    placeholder="example@email.com"
                    value={regForm.email}
                    onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field-row">
                <div className="auth-field">
                  <label htmlFor="reg-password">
                    Mật khẩu <span className="auth-required">*</span>
                  </label>
                  <div className="auth-input-wrap">
                    <IoLockClosedOutline className="auth-input-icon" />
                    <input
                      id="reg-password"
                      type={showRegPwd ? 'text' : 'password'}
                      placeholder="Tối thiểu 6 ký tự"
                      value={regForm.password}
                      onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-pwd-toggle"
                      onClick={() => setShowRegPwd(p => !p)}
                      tabIndex={-1}
                      aria-label={showRegPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showRegPwd ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    </button>
                  </div>
                  {strength && (
                    <div className="auth-pwd-strength">
                      <div className="auth-pwd-bar">
                        <div style={{ width: strength.width, background: strength.color }}></div>
                      </div>
                      <span style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <div className="auth-field">
                  <label htmlFor="reg-confirm">
                    Xác nhận mật khẩu <span className="auth-required">*</span>
                  </label>
                  <div className="auth-input-wrap">
                    <IoLockClosedOutline className="auth-input-icon" />
                    <input
                      id="reg-confirm"
                      type={showRegConfirm ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      value={regForm.confirmPassword}
                      onChange={e => setRegForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-pwd-toggle"
                      onClick={() => setShowRegConfirm(p => !p)}
                      tabIndex={-1}
                      aria-label={showRegConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showRegConfirm ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    </button>
                  </div>
                  {regForm.confirmPassword && (
                    <div className={`auth-match-hint ${regForm.password === regForm.confirmPassword ? 'match' : 'no-match'}`}>
                      {regForm.password === regForm.confirmPassword ? (
                        <>
                          <IoCheckmarkCircleOutline style={{ color: '#16a34a' }} /> Mật khẩu khớp
                        </>
                      ) : (
                        <>
                          <IoCloseCircleOutline style={{ color: '#ef4444' }} /> Chưa khớp
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="auth-terms">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <a href="#" onClick={e => e.preventDefault()}>Điều khoản dịch vụ</a>{' '}
                và{' '}
                <a href="#" onClick={e => e.preventDefault()}>Chính sách bảo mật</a> của PhoneZone.
              </p>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={regLoading || regSuccess}
              >
                {regLoading ? (
                  <>
                    <IoReloadOutline className="fa-spin" style={{ marginRight: 6 }} />
                    <span>Đang đăng ký...</span>
                  </>
                ) : regSuccess ? (
                  <>
                    <IoCheckmarkCircleOutline style={{ marginRight: 6 }} />
                    <span>Đăng ký thành công!</span>
                  </>
                ) : (
                  <>
                    <IoPersonAddOutline style={{ fontSize: '1.2rem', marginRight: 6 }} />
                    <span>Tạo tài khoản</span>
                  </>
                )}
              </button>

              <p className="auth-switch-hint">
                Đã có tài khoản?{' '}
                <button type="button" className="auth-link-btn" onClick={() => setTab('login')}>
                  Đăng nhập ngay
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
