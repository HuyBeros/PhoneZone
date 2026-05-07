import { useNavigate } from 'react-router-dom';
import { fmt } from '../utils/utils';

export default function RepairServiceCard({ service }) {
  const navigate = useNavigate();

  return (
    <div className="product-card" onClick={() => navigate(`/repair/${service.id}`)}>
      <div className="product-badges">
        <span className="badge-tag badge-hot">Dịch vụ</span>
      </div>
      <div className="product-img">
        <img 
          src={service.link || 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&q=80&w=400'} 
          alt={service.tenDichVu} 
          loading="lazy" 
        />
      </div>
      <div className="product-info">
        <div className="product-brand-tag">Sửa chữa</div>
        <div className="product-name">{service.tenDichVu}</div>
        <div className="product-rating">
          <span className="stars-small">★★★★★</span>
          <span className="rating-count">(Uy tín)</span>
        </div>
        <div className="product-price">
          <span className="price-current">{service.giaHienThi || fmt(service.giaSo)}</span>
        </div>
        <div className="product-installment">
          Bảo hành <span>6-12 tháng</span>
        </div>
        <div className="product-actions">
          <button
            className="btn-cart"
            onClick={(e) => { e.stopPropagation(); navigate(`/repair/${service.id}`); }}
          >
            <i className="fa fa-calendar-alt"></i> Đặt lịch
          </button>
          <button 
            className="btn-view" 
            title="Xem chi tiết"
            onClick={(e) => { e.stopPropagation(); navigate(`/repair/${service.id}`); }}
          >
            <i className="fa fa-info-circle"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
