import { useCart } from '../store/CartContext';
import { fmt, discount } from '../utils/utils';

export default function ProductCard({ product: p }) {
  const { addToCart } = useCart();
  const disc = p.oldPrice ? discount(p.price, p.oldPrice) : '';

  return (
    <div className="product-card">
      <div className="product-badges">
        {p.isNew            && <span className="badge-tag badge-new">Mới</span>}
        {p.badge === 'sale' && <span className="badge-tag badge-sale">Sale</span>}
        {p.badge === 'hot'  && <span className="badge-tag badge-hot">Hot</span>}
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
          {p.oldPrice && <span className="price-old">{fmt(p.oldPrice)}</span>}
          {disc       && <span className="price-discount">{disc}</span>}
        </div>
        <div className="product-installment">
          Trả góp 0% từ <span>{fmt(Math.round(p.price / 12))}/tháng</span>
        </div>
        <div className="product-actions">
          <button
            className="btn-cart"
            onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
          >
            <i className="fa fa-cart-plus"></i> Mua ngay
          </button>
          <button className="btn-view" title="Xem nhanh">
            <i className="fa fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
