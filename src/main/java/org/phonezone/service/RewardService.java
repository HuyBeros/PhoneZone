package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.phonezone.entity.Coupon;
import org.phonezone.entity.User;
import org.phonezone.entity.UserCoupon;

import java.util.List;

@ApplicationScoped
public class RewardService {

    public List<Coupon> getAllActiveCoupons() {
        return Coupon.find("isActive", true).list();
    }

    public List<UserCoupon> getUserCoupons(String username) {
        User user = User.find("username", username).firstResult();
        if (user == null) return List.of();
        
        return UserCoupon.find("user = ?1 order by acquiredAt desc", user).list();
    }

    @Transactional
    public UserCoupon redeemCoupon(String username, Long couponId) {
        User user = User.find("username", username).firstResult();
        Coupon coupon = Coupon.findById(couponId);

        if (user == null || coupon == null || !coupon.isActive) {
            return null;
        }

        // Check points
        if (user.rewardPoints < coupon.pointsRequired) {
            throw new IllegalArgumentException("Không đủ điểm để đổi mã này");
        }

        // Deduct points
        user.rewardPoints -= coupon.pointsRequired;
        user.persist();

        // Create UserCoupon
        UserCoupon uc = new UserCoupon();
        uc.user = user;
        uc.coupon = coupon;
        uc.status = "UNUSED";
        uc.persist();

        return uc;
    }
}
