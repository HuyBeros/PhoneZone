import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { fetchApi } from '../api/apiClient';

// For UI reference to show available tiers (can also be fetched from /api/rewards/coupons/available)
export const COUPON_TIERS = [
  { id: 1, points: 100,  discount: 20000,  label: 'Giảm 20.000đ',              code: 'PZ20K',  freeShip: false, color: '#3fb950' },
  { id: 2, points: 250,  discount: 50000,  label: 'Giảm 50.000đ',              code: 'PZ50K',  freeShip: false, color: '#58a6ff' },
  { id: 3, points: 500,  discount: 100000, label: 'Giảm 100.000đ',             code: 'PZ100K', freeShip: false, color: '#f0a500' },
  { id: 4, points: 1000, discount: 200000, label: 'Giảm 200.000đ + Miễn ship', code: 'PZ200K', freeShip: true,  color: '#e63946' },
];

const PointsContext = createContext();

export function PointsProvider({ children }) {
  const { showToast } = useToast();
  const { token } = useAuth();

  const [points, setPoints] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const fetchRewardsData = useCallback(async () => {
    if (!token) {
      setPoints(0);
      setCoupons([]);
      setAppliedCoupon(null);
      return;
    }
    try {
      const pData = await fetchApi('/rewards/points');
      if (pData) setPoints(pData.points);

      const cData = await fetchApi('/rewards/coupons/my');
      if (cData) {
        setCoupons(cData.map(c => ({
          ...c,
          label: c.description,
          used: c.status === 'USED'
        })));
      }
    } catch (e) {
      console.error("Lỗi lấy điểm/coupon", e);
    }
  }, [token]);

  useEffect(() => {
    fetchRewardsData();
  }, [fetchRewardsData]);

  // Đổi điểm lấy coupon
  const redeemPoints = useCallback(async (couponId) => {
    if (!token) return false;
    try {
      await fetchApi(`/rewards/redeem/${couponId}`, { method: 'POST' });
      showToast(`🎉 Đổi thành công mã giảm giá!`);
      fetchRewardsData(); // reload points and coupons
      return true;
    } catch (e) {
      showToast(`❌ ${e.message}`);
      return false;
    }
  }, [token, showToast, fetchRewardsData]);

  // Áp dụng coupon vào giỏ hàng
  const applyCoupon = useCallback((code) => {
    const trimmed = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code === trimmed && !c.used);
    if (!coupon) {
      showToast('❌ Mã không hợp lệ hoặc đã được sử dụng!');
      return false;
    }
    setAppliedCoupon(coupon);
    showToast(`✅ Áp dụng mã "${trimmed}" thành công! Giảm ${coupon.discountAmount.toLocaleString()}đ`);
    return true;
  }, [coupons, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('🗑️ Đã xóa mã giảm giá');
  }, [showToast]);

  // Đánh dấu coupon đã dùng sau khi thanh toán
  const markCouponUsed = useCallback(() => {
    setAppliedCoupon(null);
    fetchRewardsData(); // reload immediately
  }, [fetchRewardsData]);

  return (
    <PointsContext.Provider value={{
      points, coupons, appliedCoupon,
      redeemPoints, applyCoupon, removeCoupon, markCouponUsed, fetchRewardsData
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export const usePoints = () => useContext(PointsContext);
