import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../api/apiClient';

export default function RepairDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deviceType: '',
    deviceModel: '',
    issueDescription: '',
    repairService: '',
    priority: 'NORMAL',
    appointmentDate: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const deviceTypes = ['iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Asus', 'Nokia', 'Khác'];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    fetchApi(`/repairs/services`)
      .then(services => {
        const found = services.find(s => s.id === parseInt(id));
        if (found) {
          setService(found);
          setFormData(prev => ({ ...prev, repairService: found.tenDichVu }));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const submitData = {
        ...formData,
        appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate).toISOString() : null
      };

      await fetchApi('/repairs', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });

      setSuccess(true);
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deviceType: '',
        deviceModel: '',
        issueDescription: '',
        repairService: service.tenDichVu,
        priority: 'NORMAL',
        appointmentDate: ''
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Đang tải thông tin dịch vụ...</h2>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy dịch vụ!</h2>
        <button className="btn btn-primary" onClick={() => navigate('/repair')} style={{ marginTop: '20px' }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fa fa-home"></i> Trang chủ</Link>
          <span className="sep"><i className="fa fa-chevron-right"></i></span>
          <Link to="/repair">Dịch vụ sửa chữa</Link>
          <span className="sep"><i className="fa fa-chevron-right"></i></span>
          <span>{service.tenDichVu}</span>
        </div>

        {success && (
          <div className="repair-alert repair-alert-success">
            <i className="fas fa-check-circle"></i>
            <div>
              <strong>Đặt lịch thành công!</strong>
              <p>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="repair-alert repair-alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <div>
              <strong>Có lỗi xảy ra!</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="pd-main">
          {/* Cột trái: Icon dịch vụ */}
          <div className="pd-left">
            <div className="pd-img-main">
              <img 
                src={service.link || 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&q=80&w=800'} 
                alt={service.tenDichVu} 
                loading="lazy" 
              />
              <div className="pd-badges">
                <span className="badge-tag badge-hot">Dịch vụ</span>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="pd-right">
            <h1 className="pd-title">{service.tenDichVu}</h1>
            <div className="pd-rating">
              <span className="stars-small">★★★★★</span>
              <span className="rating-text">5.0 (Dịch vụ uy tín)</span>
            </div>

            <div className="pd-price-box">
              <div className="pd-price-current">{service.giaHienThi}</div>
            </div>

            <div className="pd-promotions">
              <div className="pd-promo-title"><i className="fa fa-gift"></i> Ưu đãi & Cam kết</div>
              <ul>
                <li><i className="fas fa-check-circle"></i> Linh kiện chính hãng 100%</li>
                <li><i className="fas fa-check-circle"></i> Bảo hành 6-12 tháng</li>
                <li><i className="fas fa-check-circle"></i> Sửa chữa nhanh trong ngày</li>
                <li><i className="fas fa-check-circle"></i> Miễn phí kiểm tra và vệ sinh máy</li>
                <li><i className="fas fa-check-circle"></i> Hỗ trợ 24/7</li>
              </ul>
            </div>

            <div className="pd-actions">
              <button 
                className="btn-buy-now" 
                onClick={() => setShowBookingForm(!showBookingForm)}
              >
                <strong><i className="fa fa-calendar-alt"></i> ĐẶT LỊCH NGAY</strong>
                <span>Nhận máy trong ngày - Bảo hành dài hạn</span>
              </button>
              <div className="pd-btn-group">
                <a href="tel:1900xxxx" className="btn-add-cart">
                  <i className="fa fa-phone"></i> Gọi tư vấn: 1900 xxxx
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form đặt lịch */}
        {showBookingForm && (
          <div className="repair-booking-form">
            <h2><i className="fa fa-calendar-check"></i> Đặt Lịch Sửa Chữa</h2>
            <form onSubmit={handleSubmit} className="repair-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customerName">
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerPhone">
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    placeholder="0123456789"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customerEmail">Email</label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="deviceType">
                    Loại thiết bị <span className="required">*</span>
                  </label>
                  <select
                    id="deviceType"
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn loại thiết bị</option>
                    {deviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="deviceModel">
                    Model thiết bị <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="deviceModel"
                    name="deviceModel"
                    value={formData.deviceModel}
                    onChange={handleChange}
                    required
                    placeholder="VD: iPhone 13 Pro, Galaxy S21"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="appointmentDate">Ngày hẹn</label>
                  <input
                    type="datetime-local"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="issueDescription">
                  Mô tả vấn đề <span className="required">*</span>
                </label>
                <textarea
                  id="issueDescription"
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Mô tả chi tiết vấn đề của thiết bị..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Mức độ ưu tiên</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="NORMAL">Bình thường</option>
                    <option value="URGENT">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Xác nhận đặt lịch
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Thông tin chi tiết dịch vụ */}
        <div className="pd-specs">
          <div className="pd-section-title">Thông Tin Dịch Vụ</div>
          <table className="specs-table">
            <tbody>
              <tr>
                <td className="spec-name">Tên dịch vụ</td>
                <td className="spec-value">{service.tenDichVu}</td>
              </tr>
              <tr>
                <td className="spec-name">Giá dịch vụ</td>
                <td className="spec-value">{service.giaHienThi}</td>
              </tr>
              <tr>
                <td className="spec-name">Thời gian sửa</td>
                <td className="spec-value">Trong ngày (1-3 giờ)</td>
              </tr>
              <tr>
                <td className="spec-name">Bảo hành</td>
                <td className="spec-value">6-12 tháng</td>
              </tr>
              <tr>
                <td className="spec-name">Linh kiện</td>
                <td className="spec-value">Chính hãng 100%</td>
              </tr>
              <tr>
                <td className="spec-name">Hỗ trợ</td>
                <td className="spec-value">24/7 qua hotline và email</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quy trình sửa chữa */}
        <div className="pd-specs">
          <div className="pd-section-title">Quy Trình Sửa Chữa</div>
          <div className="repair-process">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Tiếp nhận & Kiểm tra</h3>
              <p>Kỹ thuật viên kiểm tra tình trạng thiết bị và báo giá chi tiết</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Sửa chữa</h3>
              <p>Thực hiện sửa chữa với linh kiện chính hãng, quy trình chuẩn</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Kiểm tra chất lượng</h3>
              <p>Test kỹ lưỡng mọi chức năng trước khi trả khách</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Bàn giao & Bảo hành</h3>
              <p>Trả máy cho khách hàng kèm phiếu bảo hành chính thức</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
