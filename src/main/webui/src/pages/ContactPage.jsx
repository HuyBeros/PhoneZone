import { useState } from 'react';
import { useToast } from '../store/ToastContext';
import { fetchApi } from '../api/apiClient';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    budget: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.', 'success', 4000);
      setFormData({
        name: '',
        email: '',
        service: '',
        budget: '',
        message: ''
      });
    } catch (err) {
      showToast('Lỗi gửi tin nhắn: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span className="sep">›</span>
            <span>Liên hệ</span>
          </div>
          <h1 className="contact-hero-title">Liên Hệ Với <span className="highlight">PhoneZone</span></h1>
          <p className="contact-hero-sub">Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại thông tin và chúng tôi sẽ liên hệ ngay!</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Left Column - Contact Info */}
            <div className="contact-info-col">
              <div className="contact-intro">
                <h2 className="contact-section-title">Let's Talk</h2>
                <p className="contact-intro-text">
                  Bạn có ý tưởng lớn hoặc thương hiệu cần phát triển và cần hỗ trợ? 
                  Hãy liên hệ với chúng tôi, chúng tôi rất muốn được lắng nghe về 
                  dự án của bạn và cung cấp sự hỗ trợ tốt nhất.
                </p>
              </div>

              <div className="contact-details">
                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <i className="fa fa-envelope"></i>
                  </div>
                  <div className="contact-detail-content">
                    <h3>Email</h3>
                    <a href="mailto:support@phonezone.vn">support@phonezone.vn</a>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <i className="fa fa-phone"></i>
                  </div>
                  <div className="contact-detail-content">
                    <h3>Hotline</h3>
                    <a href="tel:1900123456">1900 123 456</a>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="contact-detail-icon">
                    <i className="fa fa-map-marker-alt"></i>
                  </div>
                  <div className="contact-detail-content">
                    <h3>Địa chỉ</h3>
                    <p>123 Nguyễn Huệ, Quận 1<br />TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
              </div>

              <div className="contact-socials">
                <h3>Socials</h3>
                <div className="contact-social-links">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="contact-social-link">
                    <i className="fab fa-instagram"></i>
                    <span>Instagram</span>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="contact-social-link">
                    <i className="fab fa-twitter"></i>
                    <span>Twitter</span>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="contact-social-link">
                    <i className="fab fa-facebook"></i>
                    <span>Facebook</span>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="contact-social-link">
                    <i className="fab fa-youtube"></i>
                    <span>YouTube</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="contact-form-col">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Họ và tên</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service">Bạn quan tâm đến dịch vụ nào?</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn dịch vụ</option>
                    <option value="mua-dien-thoai">Mua điện thoại</option>
                    <option value="bao-hanh">Bảo hành & Sửa chữa</option>
                    <option value="doi-tra">Đổi trả sản phẩm</option>
                    <option value="tu-van">Tư vấn sản phẩm</option>
                    <option value="hop-tac">Hợp tác kinh doanh</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Ngân sách dự kiến</label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn mức ngân sách</option>
                    <option value="duoi-5tr">Dưới 5 triệu</option>
                    <option value="5-10tr">5 - 10 triệu</option>
                    <option value="10-20tr">10 - 20 triệu</option>
                    <option value="20-30tr">20 - 30 triệu</option>
                    <option value="tren-30tr">Trên 30 triệu</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Nội dung</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung bạn muốn trao đổi..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      Gửi tin nhắn
                      <i className="fa fa-paper-plane"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map-section">
        <div className="container">
          <h2 className="section-title text-center">Tìm Chúng Tôi Tại Đây</h2>
          <div className="contact-map-wrap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4967039194!2d106.70298731533417!3d10.775015992321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0xb3ff69197b10ec4f!2zTmd1eeG7hW4gSHXhu4csIFF14bqtbiAxLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: 'var(--radius)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="PhoneZone Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="store-locations-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-tag">Hệ thống cửa hàng</span>
              <h2 className="section-title">Cửa Hàng <span className="highlight">PhoneZone</span></h2>
            </div>
          </div>
          <div className="store-grid">
            <div className="store-card">
              <div className="store-icon">
                <i className="fa fa-store"></i>
              </div>
              <h3>PhoneZone Quận 1</h3>
              <p className="store-address">
                <i className="fa fa-map-marker-alt"></i>
                123 Nguyễn Huệ, Quận 1, TP.HCM
              </p>
              <p className="store-phone">
                <i className="fa fa-phone"></i>
                (028) 1234 5678
              </p>
              <p className="store-hours">
                <i className="fa fa-clock"></i>
                8:00 - 22:00 (Hàng ngày)
              </p>
            </div>

            <div className="store-card">
              <div className="store-icon">
                <i className="fa fa-store"></i>
              </div>
              <h3>PhoneZone Hà Nội</h3>
              <p className="store-address">
                <i className="fa fa-map-marker-alt"></i>
                456 Hoàn Kiếm, Hà Nội
              </p>
              <p className="store-phone">
                <i className="fa fa-phone"></i>
                (024) 1234 5678
              </p>
              <p className="store-hours">
                <i className="fa fa-clock"></i>
                8:00 - 22:00 (Hàng ngày)
              </p>
            </div>

            <div className="store-card">
              <div className="store-icon">
                <i className="fa fa-store"></i>
              </div>
              <h3>PhoneZone Đà Nẵng</h3>
              <p className="store-address">
                <i className="fa fa-map-marker-alt"></i>
                789 Hải Châu, Đà Nẵng
              </p>
              <p className="store-phone">
                <i className="fa fa-phone"></i>
                (0236) 1234 567
              </p>
              <p className="store-hours">
                <i className="fa fa-clock"></i>
                8:00 - 22:00 (Hàng ngày)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
