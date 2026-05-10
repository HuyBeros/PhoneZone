import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../api/apiClient';
import RepairServiceCard from '../components/RepairServiceCard';

const RepairPage = () => {
  const [repairServices, setRepairServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadRepairServices();
  }, []);

  const loadRepairServices = async () => {
    try {
      const services = await fetchApi('/repairs/services');
      setRepairServices(services || []);
    } catch (err) {
      console.error('Error loading repair services:', err);
      setRepairServices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-page">
      <div className="brand-page-hero">
        <div className="container">
          <div className="brand-hero-inner">
            <div className="brand-hero-icon-wrap">
              <i className="fas fa-screwdriver-wrench"></i>
            </div>
            <div className="brand-hero-text">
              <h1>Dịch Vụ Sửa Chữa Điện Thoại</h1>
              <p>Chuyên nghiệp - Nhanh chóng - Uy tín - Bảo hành 6-12 tháng</p>
              <div className="brand-hero-tags">
                <span className="brand-hero-tag"><i className="fas fa-check-circle"></i> Linh kiện chính hãng</span>
                <span className="brand-hero-tag"><i className="fas fa-stopwatch"></i> Sửa nhanh lấy liền</span>
                <span className="brand-hero-tag"><i className="fas fa-shield-halved"></i> Bảo hành uy tín</span>
              </div>
            </div>
            <div className="brand-hero-count">
              <strong>{repairServices.length > 0 ? repairServices.length : '10+'}</strong>
              <div className="brand-hero-count-label">DỊCH VỤ</div>
              <span>Sửa Chữa Tận Tâm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fas fa-house"></i> Trang chủ</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
          <span>Dịch vụ sửa chữa</span>
        </div>

        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center' }}>
            <h2>Đang tải dịch vụ...</h2>
          </div>
        ) : repairServices.length === 0 ? (
          <div style={{ padding: '100px 0', textAlign: 'center' }}>
            <h2>Chưa có dịch vụ nào</h2>
            <p>Vui lòng quay lại sau</p>
          </div>
        ) : (
          <>
            <div className="brand-header">
              <h2>Danh Sách Dịch Vụ</h2>
              <div className="brand-count">{repairServices.length} dịch vụ</div>
            </div>

            <div className="products-grid">
              {repairServices.map(service => (
                <RepairServiceCard key={service.id} service={service} />
              ))}
            </div>
          </>
        )}

        {/* Thông tin cam kết */}
        <div className="repair-commitments">
          <h2>Cam Kết Của PhoneZone</h2>
          <div className="commitments-grid">
            <div className="commitment-item">
              <i className="fas fa-certificate"></i>
              <h3>Linh kiện chính hãng</h3>
              <p>100% linh kiện zin, chất lượng cao</p>
            </div>
            <div className="commitment-item">
              <i className="fas fa-shield-halved"></i>
              <h3>Bảo hành dài hạn</h3>
              <p>Bảo hành 6-12 tháng cho mọi dịch vụ</p>
            </div>
            <div className="commitment-item">
              <i className="fas fa-clock"></i>
              <h3>Sửa chữa nhanh</h3>
              <p>Hoàn thành trong ngày, không phải chờ đợi</p>
            </div>
            <div className="commitment-item">
              <i className="fas fa-hand-holding-dollar"></i>
              <h3>Giá cả minh bạch</h3>
              <p>Báo giá rõ ràng, không phát sinh chi phí</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairPage;
