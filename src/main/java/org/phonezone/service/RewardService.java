package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.enterprise.event.Observes;
import io.quarkus.runtime.StartupEvent;
import org.phonezone.entity.Coupon;
import org.phonezone.entity.User;
import org.phonezone.entity.UserCoupon;

import java.util.List;

@ApplicationScoped
public class RewardService {

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        if (Coupon.count() == 0) {
            seedCoupon("PZ20K", 20000L, 100, "Giảm 20.000đ");
            seedCoupon("PZ50K", 50000L, 250, "Giảm 50.000đ");
            seedCoupon("PZ100K", 100000L, 500, "Giảm 100.000đ");
            seedCoupon("PZ200K", 200000L, 1000, "Giảm 200.000đ + Miễn ship");
        }
    }

    private void seedCoupon(String code, Long discount, Integer points, String desc) {
        Coupon c = new Coupon();
        c.code = code;
        c.discountAmount = discount;
        c.pointsRequired = points;
        c.description = desc;
        c.isActive = true;
        c.persist();
    }

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

    // --- ADMIN METHODS ---
    
    public List<Coupon> getAllCoupons() {
        return Coupon.find("order by createdAt desc").list();
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        // Kiểm tra trùng code
        if (Coupon.find("code", coupon.code).firstResult() != null) {
            throw new IllegalArgumentException("Mã khuyến mãi đã tồn tại");
        }
        coupon.persist();
        return coupon;
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon updatedCoupon) {
        Coupon existing = Coupon.findById(id);
        if (existing == null) {
            return null;
        }

        // Nếu đổi code, kiểm tra trùng
        if (!existing.code.equals(updatedCoupon.code) && Coupon.find("code", updatedCoupon.code).firstResult() != null) {
            throw new IllegalArgumentException("Mã khuyến mãi đã tồn tại");
        }

        existing.code = updatedCoupon.code;
        existing.discountAmount = updatedCoupon.discountAmount;
        existing.pointsRequired = updatedCoupon.pointsRequired;
        existing.description = updatedCoupon.description;
        existing.isActive = updatedCoupon.isActive;

        existing.persist();
        return existing;
    }

    @Transactional
    public boolean deleteCoupon(Long id) {
        return Coupon.deleteById(id);
    }
}
