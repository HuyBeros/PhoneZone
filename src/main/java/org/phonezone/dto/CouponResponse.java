package org.phonezone.dto;

import org.phonezone.entity.Coupon;

public class CouponResponse {
    public Long id;
    public String code;
    public Long discountAmount;
    public Integer pointsRequired;
    public String description;

    public static CouponResponse from(Coupon coupon) {
        CouponResponse dto = new CouponResponse();
        dto.id = coupon.id;
        dto.code = coupon.code;
        dto.discountAmount = coupon.discountAmount;
        dto.pointsRequired = coupon.pointsRequired;
        dto.description = coupon.description;
        return dto;
    }
}
