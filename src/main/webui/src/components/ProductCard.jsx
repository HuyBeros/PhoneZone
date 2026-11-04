import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { useCompare } from '../store/CompareContext';
import { useToast } from '../store/ToastContext';
import { useWishlist } from '../hooks/useWishlist';
import { fmt, discount, getQuickSpecs } from '../utils/utils';
import {
  IoHeart,
  IoHeartOutline,
  IoStar,
  IoStarOutline,
  IoShieldCheckmarkOutline,
  IoCartOutline,
  IoGitCompareOutline,
} from 'react-icons/io5';

export default function ProductCard({ product: p }) {
  const { addToCart } = useCart();
  const { compareIds, toggleCompare } = useCompare();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const disc = p.oldPrice && p.oldPrice > p.price ? discount(p.price, p.oldPrice) : '';
  const isCompared = compareIds.includes(p.id);
  const specs = getQuickSpecs(p.specs, p.name);

  const { isWished, toggleWishlist } = useWishlist();
  const wished = isWished(p.id);

  const toggleWish = (e) => {
    e.stopPropagation();
    const added = toggleWishlist(p);
    if (added === null) return;
    if (added) {
      showToast('Đã thêm vào danh sách yêu thích ❤️', 'success');
    } else {
      showToast('Đã bỏ khỏi danh sách yêu thích', 'info');
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(p.id);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${p.id}`)}>
      {/* Badges bên trái */}
      <div className="product-badges">
        {p.isNew            && <span className="badge-tag badge-new">Mới</span>}
        {p.badge === 'sale' && <span className="badge-tag badge-sale">Sale</span>}
        {p.badge === 'hot'  && <span className="badge-tag badge-hot">Hot</span>}
        {disc               && <span className="badge-tag badge-discount">{disc}</span>}
      </div>

      {/* Nút yêu thích góc phải */}
      <button
        type="button"
        className={`product-wish${wished ? ' active' : ''}`}
        title={wished ? "Đã thích" : "Yêu thích"}
        aria-label={wished ? 'Bỏ yêu thích' : 'Yêu thích'}
        aria-pressed={wished}
        onClick={toggleWish}
      >
        {wished ? <IoHeart style={{ color: '#ef4444', fontSize: '1.15rem' }} /> : <IoHeartOutline style={{ fontSize: '1.15rem' }} />}
      </button>

      {/* Ảnh sản phẩm */}
      <div className="product-img">
        <img src={p.img} alt={p.name} loading="lazy" />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="product-info">
        <div className="product-brand-tag">{p.brand}</div>
        <h3 className="product-name" title={p.name}>{p.name}</h3>

        {/* Thông số kỹ thuật nổi bật */}
        <div className="product-quick-specs">
          {specs.length > 0 ? (
            specs.map((item, idx) => (
              <span key={idx} className="spec-chip">{item}</span>
            ))
          ) : (
            <span className="spec-chip-placeholder"></span>
          )}
        </div>

        {/* Đánh giá hoặc nhãn chính hãng */}
        <div className="product-rating">
          {p.reviews > 0 ? (
            <>
              <span className="stars-small">
                {[1, 2, 3, 4, 5].map(s => (
                  <i key={s} className={`fa-star ${s <= Math.round(p.rating) ? 'fas' : 'far'}`}></i>
                ))}
              </span>
              <span className="rating-score">{p.rating}</span>
              <span className="rating-count">({p.reviews})</span>
            </>
          ) : (
            <span className="product-genuine-pill">
              <IoShieldCheckmarkOutline style={{ color: '#10b981', verticalAlign: '-2px', marginRight: 3 }} /> Chính hãng 100%
            </span>
          )}
        </div>

        {/* Giá bán */}
        <div className="product-price">
          <span className="price-current">{fmt(p.price)}</span>
          {p.oldPrice && p.oldPrice > p.price ? (
            <span className="price-old">{fmt(p.oldPrice)}</span>
          ) : (
            <span className="price-old-placeholder"></span>
          )}
        </div>

        {/* Trả góp */}
        <div className="product-installment">
          <span className="badge-installment">Trả góp 0%</span>
          {p.price > 0 && <span className="installment-text">Từ {fmt(Math.round(p.price / 12))}/th</span>}
        </div>

        {/* Nút hành động */}
        <div className="product-actions">
          <button
            type="button"
            className="btn-cart"
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
          >
            Mua ngay
          </button>
          <button
            type="button"
            className="btn-quick-cart"
            title="Thêm nhanh vào giỏ hàng"
            onClick={handleQuickAdd}
          >
            <IoCartOutline style={{ fontSize: '1.15rem' }} />
          </button>
          <button
            type="button"
            className={`btn-view ${isCompared ? 'compared' : ''}`}
            title={isCompared ? "Đã thêm vào so sánh" : "Thêm vào so sánh"}
            onClick={(e) => { e.stopPropagation(); toggleCompare(p); }}
          >
            <IoGitCompareOutline style={{ fontSize: '1.15rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
