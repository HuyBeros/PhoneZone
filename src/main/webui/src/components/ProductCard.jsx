import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useCompare } from '../store/CompareContext';
import { fmt, discount } from '../utils/utils';

export default function ProductCard({ product: p }) {
  const { addToCart } = useCart();
  const { compareIds, toggleCompare } = useCompare();
  const navigate = useNavigate();
  const disc = p.oldPrice && p.oldPrice > p.price ? discount(p.price, p.oldPrice) : '';
  const isCompared = compareIds.includes(p.id);

  return (
    <div className="product-card" onClick={() => navigate(`/product/${p.id}`)}>
      <div className="product-badges">
        {p.isNew            && <span className="badge-tag badge-new">Mới</span>}
        {p.badge === 'sale' && <span className="badge-tag badge-sale">Sale</span>}
        {p.badge === 'hot'  && <span className="badge-tag badge-hot">Hot</span>}
        {disc && <span className="badge-tag badge-discount">{disc}</span>}
      </div>
      <div className="product-img">
        <img src={p.img} alt={p.name} loading="lazy" />
      </div>
      <div className="product-info">
        <div className="product-brand-tag">{p.brand}</div>
        <div className="product-name">{p.name}</div>
        <div className="product-rating">
          <span className="stars-small">
            {'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}
          </span>
          <span className="rating-count">({p.reviews.toLocaleString()})</span>
        </div>
        <div className="product-price">
          <span className="price-current">{fmt(p.price)}</span>
          {p.oldPrice && p.oldPrice > p.price && (
            <span className="price-old">{fmt(p.oldPrice)}</span>
          )}
        </div>
        <div className="product-actions">
          <button
            className="btn-cart"
            onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
          >
            <i className="fa fa-cart-plus"></i> Mua ngay
          </button>
          <button 
            className={`btn-view ${isCompared ? 'compared' : ''}`} 
            title={isCompared ? "Đã thêm vào so sánh" : "Thêm vào so sánh"}
            onClick={(e) => { e.stopPropagation(); toggleCompare(p.id); }}
          >
            <i className="fa fa-balance-scale"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
