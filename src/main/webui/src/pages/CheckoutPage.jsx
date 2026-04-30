import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext';
import { usePoints } from '../store/PointsContext';
import { fmt } from '../utils/utils';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { addPoints } = usePoints();
  const total = getCartTotal();
  const shippingFee = total > 10000000 ? 0 : 50000;
  const finalTotal = total + shippingFee;

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', note: '', paymentMethod: 'cod' });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (cartItems.length === 0 && !isSuccess) {
      navigate('/brand/all');
    }
  }, [cartItems, isSuccess, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập lưu đơn hàng vào hệ thống
    const orderId = 'PZ' + Math.floor(Math.random() * 1000000);
    const earnedPoints = Math.floor(finalTotal / 100000); // 1 điểm mỗi 100k
    
    // Lưu vào mock history (localStorage)
    const newOrder = { id: orderId, date: new Date().toLocaleDateString('vi-VN'), total: finalTotal, status: 'Đang xử lý', items: cartItems };
    const history = JSON.parse(localStorage.getItem('pz_orders') || '[]');
    localStorage.setItem('pz_orders', JSON.stringify([newOrder, ...history]));

    addPoints(earnedPoints);
    clearCart();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="checkout-success">
        <div className="success-icon"><i className="fa fa-check-circle"></i></div>
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

  if (cartItems.length === 0) return null;

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/"><i className="fa fa-home"></i> Trang chủ</Link>
          <span className="sep"><i className="fa fa-chevron-right"></i></span>
          <span>Thanh toán</span>
        </div>

        <h1 className="page-title">Thanh toán an toàn</h1>

        <div className="checkout-main">
          {/* Cột trái: Form thông tin */}
          <div className="checkout-left">
            <form id="checkoutForm" onSubmit={handleSubmit} className="checkout-form">
              <div className="form-section">
                <h3 className="form-title"><i className="fa fa-map-marker-alt"></i> Thông tin giao hàng</h3>
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
                <h3 className="form-title"><i className="fa fa-credit-card"></i> Phương thức thanh toán</h3>
                <div className="payment-methods">
                  <label className={`pm-label ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="cod" checked={formData.paymentMethod === 'cod'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                    <span className="pm-icon"><i className="fa fa-money-bill-wave"></i></span>
                    <span className="pm-text">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className={`pm-label ${formData.paymentMethod === 'bank' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="bank" checked={formData.paymentMethod === 'bank'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                    <span className="pm-icon"><i className="fa fa-university"></i></span>
                    <span className="pm-text">Chuyển khoản ngân hàng</span>
                  </label>
                  <label className={`pm-label ${formData.paymentMethod === 'vnpay' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="vnpay" checked={formData.paymentMethod === 'vnpay'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} />
                    <span className="pm-icon"><i className="fa fa-qrcode"></i></span>
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
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.img} alt={item.name} />
                    <div className="si-info">
                      <div className="si-name">{item.name}</div>
                      <div className="si-qty-price">
                        <span className="si-qty">SL: {item.quantity}</span>
                        <span className="si-price">{fmt(item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="total-row"><span>Tạm tính</span><span>{fmt(total)}</span></div>
                <div className="total-row"><span>Phí giao hàng</span><span>{shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}</span></div>
                <div className="total-row final"><span>Tổng cộng</span><span>{fmt(finalTotal)}</span></div>
              </div>
              <button form="checkoutForm" type="submit" className="btn-place-order">
                XÁC NHẬN ĐẶT HÀNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
