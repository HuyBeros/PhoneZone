import { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from './ToastContext';

export const COUPON_TIERS = [
  { id: 'c100',  points: 100,  discount: 20000,  label: 'Giảm 20.000đ',              code: 'PZ20K',  freeShip: false, color: '#3fb950' },
  { id: 'c250',  points: 250,  discount: 50000,  label: 'Giảm 50.000đ',              code: 'PZ50K',  freeShip: false, color: '#58a6ff' },
  { id: 'c500',  points: 500,  discount: 100000, label: 'Giảm 100.000đ',             code: 'PZ100K', freeShip: false, color: '#f0a500' },
  { id: 'c1000', points: 1000, discount: 200000, label: 'Giảm 200.000đ + Miễn ship', code: 'PZ200K', freeShip: true,  color: '#e63946' },
];

const PointsContext = createContext();

export function PointsProvider({ children }) {
  const { showToast } = useToast();

  const [points, setPoints] = useState(() =>
    parseInt(localStorage.getItem('pz_points') || '0')
  );
  const [coupons, setCoupons] = useState(() =>
    JSON.parse(localStorage.getItem('pz_coupons') || '[]')
  );
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Thêm điểm sau khi mua hàng (1 điểm / 10.000đ)
  const addPoints = useCallback((orderTotal) => {
    const earned = Math.floor(orderTotal / 10000);
    if (earned <= 0) return;
    setPoints(prev => {
      const next = prev + earned;
      localStorage.setItem('pz_points', String(next));
      return next;
    });
    showToast(`⭐ Bạn nhận được ${earned} điểm thưởng!`);
  }, [showToast]);

  // Đổi điểm lấy coupon
  const redeemPoints = useCallback((tierId) => {
    const tier = COUPON_TIERS.find(t => t.id === tierId);
    if (!tier) return;
    if (points < tier.points) {
      showToast(`❌ Không đủ điểm! Cần ${tier.points} điểm.`);
      return false;
    }
    setPoints(prev => {
      const next = prev - tier.points;
      localStorage.setItem('pz_points', String(next));
      return next;
    });
    const newCoupon = {
      ...tier,
      uid: `${tier.id}-${Date.now()}`,
      used: false,
      earnedAt: new Date().toLocaleDateString('vi-VN'),
    };
    setCoupons(prev => {
      const next = [...prev, newCoupon];
      localStorage.setItem('pz_coupons', JSON.stringify(next));
      return next;
    });
    showToast(`🎉 Đổi thành công! Mã ${tier.code} đã thêm vào ví!`);
    return true;
  }, [points, showToast]);

  // Áp dụng coupon vào giỏ hàng
  const applyCoupon = useCallback((code) => {
    const trimmed = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code === trimmed && !c.used);
    if (!coupon) {
      showToast('❌ Mã không hợp lệ hoặc đã được sử dụng!');
      return false;
    }
    setAppliedCoupon(coupon);
    showToast(`✅ Áp dụng mã "${trimmed}" thành công! Giảm ${coupon.label}`);
    return true;
  }, [coupons, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('🗑️ Đã xóa mã giảm giá');
  }, [showToast]);

  // Đánh dấu coupon đã dùng sau khi thanh toán
  const markCouponUsed = useCallback((code) => {
    setCoupons(prev => {
      const next = prev.map(c => c.code === code ? { ...c, used: true } : c);
      localStorage.setItem('pz_coupons', JSON.stringify(next));
      return next;
    });
    setAppliedCoupon(null);
  }, []);

  return (
    <PointsContext.Provider value={{
      points, coupons, appliedCoupon,
      addPoints, redeemPoints, applyCoupon, removeCoupon, markCouponUsed,
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export const usePoints = () => useContext(PointsContext);
