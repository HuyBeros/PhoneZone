import { useCart } from '../store/CartContext';
import { usePoints } from '../store/PointsContext';
import { fmt } from '../utils/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { cart, cartCount, cartTotal, cartOpen, closeCart, removeFromCart } = useCart();
  const { appliedCoupon, applyCoupon, removeCoupon, markCouponUsed, addPoints } = usePoints();
  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const discount    = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal  = Math.max(0, cartTotal - discount);
  const pointsEarn  = Math.floor(finalTotal / 10000);

  const handleApply = () => {
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`cart-overlay${cartOpen ? ' active' : ''}`}
        onClick={closeCart}
      />
      <aside className={`cart-sidebar${cartOpen ? ' active' : ''}`}>
        <div className="cart-header">
          <h3><i className="fa fa-shopping-cart"></i> Giỏ hàng ({cartCount})</h3>
          <button className="close-cart" onClick={closeCart}>
            <i className="fa fa-times"></i>
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <i className="fa fa-shopping-cart"></i>
              <p>Giỏ hàng đang trống</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.img} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{fmt(item.price)} × {item.qty}</div>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          {/* Coupon input */}
          {cart.length > 0 && (
            <>
              {!appliedCoupon ? (
                <div className="coupon-input-wrap">
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      placeholder="Nhập mã coupon..."
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleApply()}
                    />
                    <button className="btn-apply-coupon" onClick={handleApply}>
                      Áp dụng
                    </button>
                  </div>
                  <div className="coupon-hint">
                    <i className="fa fa-star"></i>
                    <a href="#/rewards">Xem ví coupon của tôi</a>
                  </div>
                </div>
              ) : (
                <div className="applied-coupon">
                  <div className="applied-coupon-left">
                    <i className="fa fa-tag"></i>
                    <div>
                      <div className="applied-coupon-code">{appliedCoupon.code}</div>
                      <div className="applied-coupon-label">{appliedCoupon.label}</div>
                    </div>
                  </div>
                  <button className="remove-coupon" onClick={removeCoupon}>
                    <i className="fa fa-times"></i>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Tổng tiền */}
          <div className="cart-totals">
            <div className="cart-total-row">
              <span>Tạm tính:</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="cart-total-row discount-row">
                <span><i className="fa fa-tag"></i> Giảm giá:</span>
                <span>-{fmt(discount)}</span>
              </div>
            )}
            {appliedCoupon?.freeShip && (
              <div className="cart-total-row discount-row">
                <span><i className="fa fa-truck"></i> Phí ship:</span>
                <span>Miễn phí</span>
              </div>
            )}
            <div className="cart-total-row total-row">
              <span>Tổng cộng:</span>
              <strong>{fmt(finalTotal)}</strong>
            </div>
            {cart.length > 0 && (
              <div className="cart-points-earn">
                <i className="fa fa-star"></i>
                Đặt hàng này nhận <strong>{pointsEarn} điểm</strong> thưởng
              </div>
            )}
          </div>

          <button
            className="btn btn-primary full"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Thanh Toán <i className="fa fa-arrow-right"></i>
          </button>
          <p className="cart-note">
            <i className="fa fa-lock"></i> Thanh toán bảo mật SSL 256-bit
          </p>
        </div>
      </aside>
    </>
  );
}
