import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { usePoints } from '../store/PointsContext';
import { fmt } from '../utils/utils';
import { fetchApi } from '../api/apiClient';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, fetchCart } = useCart();
  const { appliedCoupon, markCouponUsed } = usePoints();
  
  const total = cartTotal || 0;
  const shippingFee = total > 10000000 ? 0 : 50000;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, total + shippingFee - discountAmount);

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '', paymentMethod: 'cod' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (cart.length === 0 && !isSuccess) {
      navigate('/brand/all');
    }
  }, [cart, isSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const orderRequest = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: '',
        shippingAddress: formData.address,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(orderRequest)
      });

      if (appliedCoupon) {
        markCouponUsed();
      }
      fetchCart(); // Xóa giỏ hàng local bằng cách fetch lại (Backend đã clear giỏ hàng)
      
      if (res && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="checkout-success">
        <div className="success-icon"><i className="fas fa-circle-check"></i></div>
        <h2>Đặt hàng thành công!</h2>
        <p>Cảm ơn bạn đã tin tưởng mua sắm tại PhoneZone.</p>
        <p>Chúng tôi sẽ gọi xác nhận đơn hàng trong vòng 15 phút.</p>
        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary">Xem đơn hàng</Link>
          <Link to="/" className="btn btn-outline">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) return null;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fas fa-house"></i> Trang chủ</Link>
          <span className="sep"><i className="fas fa-chevron-right"></i></span>
          <span>Thanh toán</span>
        </div>

        <h1 className="page-title">Thanh toán an toàn</h1>

        {errorMsg && <div className="alert alert-danger" style={{color: 'red', marginBottom: '20px'}}>{errorMsg}</div>}

        <div className="checkout-main">
          {/* Cột trái: Form thông tin */}
          <div className="checkout-left">
            <form id="checkoutForm" onSubmit={handleSubmit} className="checkout-form">
              <div className="form-section">
                <h3 className="form-title"><i className="fas fa-location-dot"></i> Thông tin giao hàng</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input type="text" required placeholder="Nhập họ tên" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input type="tel" required placeholder="Nhập SĐT" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ nhận hàng *</label>
                  <input type="text" required placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Ghi chú (Tùy chọn)</label>
                  <textarea placeholder="Ghi chú thêm về đơn hàng" rows="3" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-title"><i className="fas fa-credit-card"></i> Phương thức thanh toán</h3>
                <div className="payment-methods">
                  <label className={`pm-label ${formData.paymentMethod === 'COD' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="COD" checked={formData.paymentMethod === 'COD'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                    <span className="pm-icon"><i className="fas fa-money-bill-wave"></i></span>
                    <span className="pm-text">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className={`pm-label ${formData.paymentMethod === 'BANK' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="BANK" checked={formData.paymentMethod === 'BANK'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                    <span className="pm-icon"><i className="fas fa-building-columns"></i></span>
                    <span className="pm-text">Chuyển khoản ngân hàng</span>
                  </label>
                  <label className={`pm-label ${formData.paymentMethod === 'VNPAY' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="VNPAY" checked={formData.paymentMethod === 'VNPAY'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                    <span className="pm-icon"><i className="fas fa-wallet"></i></span>
                    <span className="pm-text">Thanh toán qua VNPAY</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="checkout-right">
            <div className="order-summary">
              <h3 className="summary-title">Tóm tắt đơn hàng</h3>
              <div className="summary-items">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.img} alt={item.name} />
                    <div className="si-info">
                      <div className="si-name">{item.name}</div>
                      <div className="si-qty-price">
                        <span className="si-qty">SL: {item.qty}</span>
                        <span className="si-price">{fmt(item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="total-row"><span>Tạm tính</span><span>{fmt(total)}</span></div>
                <div className="total-row"><span>Phí giao hàng</span><span>{shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}</span></div>
                {discountAmount > 0 && (
                  <div className="total-row discount"><span>Giảm giá</span><span>-{fmt(discountAmount)}</span></div>
                )}
                <div className="total-row final"><span>Tổng cộng</span><span>{fmt(finalTotal)}</span></div>
              </div>
              <button form="checkoutForm" type="submit" className="btn-place-order" disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
