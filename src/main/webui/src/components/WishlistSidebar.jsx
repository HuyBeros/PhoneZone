import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../store/CartContext';
import { useRef, useState } from 'react';
import { fmt } from '../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useDrawer } from '../hooks/useDrawer';

export default function WishlistSidebar() {
  const { wishlist, wishlistCount, wishlistOpen, closeWishlist, removeFromWishlist, clearWishlist, authenticated, requestLogin } = useWishlist();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);
  const addingRef = useRef(false);
  const navigate = useNavigate();
  const drawerRef = useDrawer(wishlistOpen, closeWishlist);

  const handleAddToCart = async item => {
    if (addingRef.current) return;
    addingRef.current = true;
    setAddingId(item.id);
    try { await addToCart(item.id); }
    finally { addingRef.current = false; setAddingId(null); }
  };

  const handleGoToProduct = (id) => {
    closeWishlist();
    navigate(`/product/${id}`);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`wishlist-overlay${wishlistOpen ? ' active' : ''}`}
        onClick={closeWishlist}
      />

      {/* Sidebar drawer */}
      <aside ref={drawerRef} className={`wishlist-sidebar${wishlistOpen ? ' active' : ''}`} role="dialog" aria-modal={wishlistOpen ? true : undefined} aria-label="Danh sách yêu thích" aria-hidden={!wishlistOpen} inert={!wishlistOpen ? '' : undefined} tabIndex={-1}>
        <div className="wishlist-header">
          <h3>
            <i className="fas fa-heart" style={{ color: '#e11d48' }}></i> Sản phẩm yêu thích ({wishlistCount})
          </h3>
          <button type="button" className="close-wishlist" onClick={closeWishlist} aria-label="Đóng">
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <div className="wishlist-body">
          {!authenticated ? (
            <div className="wishlist-empty">
              <div className="we-icon"><i className="far fa-heart" aria-hidden="true"></i></div>
              <h4>Đăng nhập để lưu yêu thích</h4>
              <p>Lưu các sản phẩm bạn quan tâm vào danh sách riêng của tài khoản.</p>
              <button type="button" className="btn btn-primary" onClick={requestLogin}>Đăng nhập</button>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <div className="we-icon">
                <i className="far fa-heart"></i>
              </div>
              <h4>Danh sách yêu thích trống</h4>
              <p>Hãy nhấn biểu tượng trái tim trên các sản phẩm bạn quan tâm để lưu lại tại đây.</p>
              <button type="button" className="btn btn-primary" onClick={closeWishlist}>
                Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <div className="wishlist-items-list">
              {wishlist.map(item => (
                <div key={item.id} className="wishlist-item">
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    className="wi-img" 
                    onClick={() => handleGoToProduct(item.id)}
                  />
                  <div className="wi-info">
                    <div 
                      className="wi-name" 
                      title={item.name} 
                      onClick={() => handleGoToProduct(item.id)}
                    >
                      {item.name}
                    </div>
                    <div className="wi-price-row">
                      <span className="wi-price">{fmt(item.price)}</span>
                      {item.oldPrice && item.oldPrice > item.price && (
                        <span className="wi-old-price">{fmt(item.oldPrice)}</span>
                      )}
                    </div>
                    <div className="wi-actions">
                      <button 
                        type="button" 
                        className="wi-btn-cart" 
                        onClick={() => handleAddToCart(item)}
                        title="Thêm vào giỏ hàng"
                        disabled={addingId !== null}
                        aria-busy={addingId === item.id}
                      >
                        <i className={addingId === item.id ? 'fas fa-spinner fa-spin' : 'fas fa-cart-plus'} aria-hidden="true"></i>
                        {addingId === item.id ? 'Đang thêm…' : 'Thêm giỏ'}
                      </button>
                      <button 
                        type="button" 
                        className="wi-btn-remove" 
                        onClick={() => removeFromWishlist(item.id)}
                        title="Bỏ khỏi yêu thích"
                        aria-label="Xóa"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlist.length > 0 && (
          <div className="wishlist-footer">
            <button type="button" className="btn btn-outline" onClick={clearWishlist}>
              <i className="fas fa-trash-can"></i> Xóa tất cả
            </button>
            <button type="button" className="btn btn-primary" onClick={closeWishlist}>
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
