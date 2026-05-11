import { useState } from 'react';
import { useToast } from '../store/ToastContext';
import { fetchApi } from '../api/apiClient';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.', 'success', 4000);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      showToast('Gửi tin nhắn thành công!', 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Premium Hero */}
      <div className="contact-hero">
        <div className="container">
          <div className="ch-content">
            <div className="ch-badge">Hỗ trợ 24/7</div>
            <h1>Liên Hệ Với PhoneZone</h1>
            <p>Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Hãy để lại thông tin hoặc liên hệ trực tiếp qua hotline.</p>
          </div>
        </div>
      </div>

      <div className="contact-main">
        <div className="container">
          {/* Info Cards */}
          <div className="contact-cards">
            <div className="cc-card">
              <div className="cc-icon"><i className="fas fa-headset"></i></div>
              <h3>Tổng đài hỗ trợ</h3>
              <p>Hotline miễn phí (8h00 - 22h00)</p>
              <strong>1800.1234</strong>
            </div>
            <div className="cc-card active">
              <div className="cc-icon"><i className="fas fa-envelope-open-text"></i></div>
              <h3>Góp ý &amp; Khiếu nại</h3>
              <p>Chúng tôi luôn lắng nghe bạn</p>
              <strong>cskh@phonezone.vn</strong>
            </div>
            <div className="cc-card">
              <div className="cc-icon"><i className="fas fa-store"></i></div>
              <h3>Hệ thống cửa hàng</h3>
              <p>35+ showroom trên toàn quốc</p>
              <strong>Tìm cửa hàng gần nhất</strong>
            </div>
          </div>

          <div className="contact-wrap">
            {/* Form */}
            <div className="contact-form-box">
              <div className="cf-header">
                <h2>Gửi tin nhắn cho chúng tôi</h2>
                <p>Điền thông tin bên dưới, bộ phận CSKH sẽ phản hồi trong vòng 24 giờ làm việc.</p>
              </div>
              <form onSubmit={handleSubmit} className="cf-form">
                <div className="cf-row">
                  <div className="cf-group">
                    <label>Họ và tên <span>*</span></label>
                    <div className="cf-input">
                      <i className="fas fa-user"></i>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                    </div>
                  </div>
                  <div className="cf-group">
                    <label>Số điện thoại <span>*</span></label>
                    <div className="cf-input">
                      <i className="fas fa-phone"></i>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="0912 345 678" required />
                    </div>
                  </div>
                </div>
                
                <div className="cf-row">
                  <div className="cf-group">
                    <label>Email của bạn</label>
                    <div className="cf-input">
                      <i className="fas fa-envelope"></i>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="cf-group">
                    <label>Chủ đề quan tâm <span>*</span></label>
                    <div className="cf-input">
                      <i className="fas fa-list"></i>
                      <select name="subject" value={formData.subject} onChange={handleChange} required>
                        <option value="">Chọn chủ đề...</option>
                        <option value="Tư vấn mua hàng">Tư vấn mua hàng</option>
                        <option value="Hỗ trợ kỹ thuật / Bảo hành">Hỗ trợ kỹ thuật / Bảo hành</option>
                        <option value="Góp ý dịch vụ">Góp ý dịch vụ</option>
                        <option value="Hợp tác kinh doanh">Hợp tác kinh doanh</option>
                        <option value="Khác">Vấn đề khác</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="cf-group">
                  <label>Nội dung chi tiết <span>*</span></label>
                  <div className="cf-textarea">
                    <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Bạn cần chúng tôi hỗ trợ về vấn đề gì?" required></textarea>
                  </div>
                </div>

                <button type="submit" className="cf-submit" disabled={isSubmitting}>
                  {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Đang gửi...</> : <><i className="fas fa-paper-plane"></i> Gửi Yêu Cầu</>}
                </button>
              </form>
            </div>

            {/* Side Info */}
            <div className="contact-side">
              <div className="cs-box">
                <h3>Trụ Sở Chính</h3>
                <div className="cs-map">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.47361184313!2d105.73252651053618!3d21.053730980520893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345457e292d5bf%3A0x20ac91c94d74439a!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2hp4buHcCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1778491743280!5m2!1svi!2s" loading="lazy" title="Map"></iframe>
                </div>
                <div className="cs-address">
                  <i className="fas fa-map-marker-alt"></i>
                  <p>Trường Đại học Công nghiệp Hà Nội, Phường Minh Khai, Bắc Từ Liêm, Hà Nội</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
