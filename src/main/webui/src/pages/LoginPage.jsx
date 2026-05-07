import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useToast } from '../store/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();
  const { showToast } = useToast();

  // Tab: 'login' | 'register'
  const [tab, setTab] = useState(location.state?.tab || 'login');

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Register form
  const [regForm, setRegForm] = useState({
    username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // Redirect nếu đã đăng nhập
  const from = location.state?.from || '/';
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user]);

  /* ── Handlers ── */
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
      showToast('Đăng nhập thành công! Chào mừng bạn trở lại 👋');
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

    // Validate
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
        phone: regForm.phone.trim() || undefined,
      });
      setRegSuccess(true);
      showToast('Đăng ký thành công! Hãy đăng nhập để tiếp tục.');
      setTimeout(() => {
        setTab('login');
        setLoginForm({ username: regForm.username.trim(), password: '' });
        setRegSuccess(false);
        setRegForm({ username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: '' });
      }, 1500);
    } catch (err) {
      setRegError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setRegLoading(false);
    }
  };

  /* ── Password strength ── */
  const pwdStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Yếu', color: '#ef4444', width: '25%' };
    if (score <= 2) return { label: 'Trung bình', color: '#f59e0b', width: '50%' };
    if (score <= 3) return { label: 'Khá', color: '#0ea5e9', width: '75%' };
    return { label: 'Mạnh', color: '#16a34a', width: '100%' };
  };
  const strength = pwdStrength(regForm.password);

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-bg">
        <div className="auth-bg-blob auth-bg-blob-1"></div>
        <div className="auth-bg-blob auth-bg-blob-2"></div>
      </div>

      <div className="auth-container">
        {/* Left panel – branding */}
        <div className="auth-left">
          <Link to="/" className="auth-logo">
            📱 Phone<span>Zone</span>
          </Link>
          <h2 className="auth-left-title">
            {tab === 'login' ? 'Chào mừng trở lại!' : 'Tham gia PhoneZone'}
          </h2>
          <p className="auth-left-sub">
            {tab === 'login'
              ? 'Đăng nhập để mua sắm, theo dõi đơn hàng và nhận ưu đãi độc quyền.'
              : 'Tạo tài khoản miễn phí và nhận ngay 100 điểm thưởng chào mừng.'}
          </p>

          <div className="auth-features">
            {[
              { icon: '🎁', text: 'Tích điểm đổi quà mỗi đơn hàng' },
              { icon: '🚀', text: 'Giao hàng nhanh trong 2 giờ' },
              { icon: '🔒', text: 'Bảo mật thông tin tuyệt đối' },
              { icon: '💬', text: 'Hỗ trợ 24/7 qua chat trực tuyến' },
            ].map((f, i) => (
              <div className="auth-feature-item" key={i}>
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <Link to="/" className="auth-back-home">
            <i className="fa fa-arrow-left"></i> Về trang chủ
          </Link>
        </div>

        {/* Right panel – form */}
        <div className="auth-right">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => { setTab('login'); setLoginError(''); }}
            >
              <i className="fa fa-sign-in-alt"></i> Đăng nhập
            </button>
            <button
              className={`auth-tab${tab === 'register' ? ' active' : ''}`}
              onClick={() => { setTab('register'); setRegError(''); }}
            >
              <i className="fa fa-user-plus"></i> Đăng ký
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="auth-form-header">
                <h3>Đăng nhập tài khoản</h3>
                <p>Nhập thông tin để tiếp tục mua sắm</p>
              </div>

              {loginError && (
                <div className="auth-alert auth-alert-error">
                  <i className="fa fa-exclamation-circle"></i> {loginError}
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="login-username">Tên đăng nhập</label>
                <div className="auth-input-wrap">
                  <i className="fa fa-user auth-input-icon"></i>
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
                  <i className="fa fa-lock auth-input-icon"></i>
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
                    <i className={`fa ${showLoginPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loginLoading}
              >
                {loginLoading
                  ? <><i className="fa fa-spinner fa-spin"></i> Đang đăng nhập...</>
                  : <><i className="fa fa-sign-in-alt"></i> Đăng nhập</>
                }
              </button>

              <p className="auth-switch-hint">
                Chưa có tài khoản?{' '}
                <button type="button" className="auth-link-btn" onClick={() => setTab('register')}>
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form className="auth-form" onSubmit={handleRegister} noValidate>
              <div className="auth-form-header">
                <h3>Tạo tài khoản mới</h3>
                <p>Điền thông tin bên dưới để bắt đầu</p>
              </div>

              {regError && (
                <div className="auth-alert auth-alert-error">
                  <i className="fa fa-exclamation-circle"></i> {regError}
                </div>
              )}
              {regSuccess && (
                <div className="auth-alert auth-alert-success">
                  <i className="fa fa-check-circle"></i> Đăng ký thành công! Đang chuyển sang đăng nhập...
                </div>
              )}

              <div className="auth-field-row">
                <div className="auth-field">
                  <label htmlFor="reg-fullname">Họ và tên <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <i className="fa fa-id-card auth-input-icon"></i>
                    <input
                      id="reg-fullname"
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
                    <i className="fa fa-phone auth-input-icon"></i>
                    <input
                      id="reg-phone"
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
                <label htmlFor="reg-username">Tên đăng nhập <span className="auth-required">*</span></label>
                <div className="auth-input-wrap">
                  <i className="fa fa-user auth-input-icon"></i>
                  <input
                    id="reg-username"
                    type="text"
                    placeholder="Tối thiểu 3 ký tự"
                    value={regForm.username}
                    onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-email">Email <span className="auth-required">*</span></label>
                <div className="auth-input-wrap">
                  <i className="fa fa-envelope auth-input-icon"></i>
                  <input
                    id="reg-email"
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
                  <label htmlFor="reg-password">Mật khẩu <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <i className="fa fa-lock auth-input-icon"></i>
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
                      <i className={`fa ${showRegPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
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
                  <label htmlFor="reg-confirm">Xác nhận mật khẩu <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap">
                    <i className="fa fa-lock auth-input-icon"></i>
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
                      <i className={`fa ${showRegConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {regForm.confirmPassword && (
                    <div className={`auth-match-hint ${regForm.password === regForm.confirmPassword ? 'match' : 'no-match'}`}>
                      <i className={`fa ${regForm.password === regForm.confirmPassword ? 'fa-check' : 'fa-times'}`}></i>
                      {regForm.password === regForm.confirmPassword ? ' Mật khẩu khớp' : ' Chưa khớp'}
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
                {regLoading
                  ? <><i className="fa fa-spinner fa-spin"></i> Đang đăng ký...</>
                  : regSuccess
                    ? <><i className="fa fa-check"></i> Đăng ký thành công!</>
                    : <><i className="fa fa-user-plus"></i> Tạo tài khoản</>
                }
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
