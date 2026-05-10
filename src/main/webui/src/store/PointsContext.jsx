import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { fetchApi } from '../api/apiClient';

// Will be fetched dynamically from the server
const PointsContext = createContext();

export function PointsProvider({ children }) {
  const { showToast } = useToast();
  const { token } = useAuth();

  const [points, setPoints] = useState(0);
  const [coupons, setCoupons] = useState([]); // user's wallet
  const [availableCoupons, setAvailableCoupons] = useState([]); // coupons available to redeem
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const fetchRewardsData = useCallback(async () => {
    try {
      // Available coupons don't require auth to view, but we'll fetch them anyway
      const availData = await fetchApi('/rewards/coupons/available').catch(() => []);
      if (availData) {
        setAvailableCoupons(availData.map((c, i) => {
          const colors = ['#3fb950', '#58a6ff', '#f0a500', '#e63946', '#9c27b0', '#00bcd4'];
          return {
            id: c.id,
            points: c.pointsRequired,
            discount: c.discountAmount,
            label: c.description || `Giảm ${c.discountAmount.toLocaleString()}đ`,
            code: c.code,
            freeShip: c.description && c.description.toLowerCase().includes('miễn ship'),
            color: colors[i % colors.length]
          };
        }).sort((a, b) => a.points - b.points));
      }

      if (!token) {
        setPoints(0);
        setCoupons([]);
        setAppliedCoupon(null);
        return;
      }

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
      points, coupons, appliedCoupon, availableCoupons,
      redeemPoints, applyCoupon, removeCoupon, markCouponUsed, fetchRewardsData
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export const usePoints = () => useContext(PointsContext);
