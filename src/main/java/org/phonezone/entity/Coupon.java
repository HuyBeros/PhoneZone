package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "coupons")
public class Coupon extends PanacheEntity {

    @Column(unique = true, nullable = false, length = 50)
    public String code;

    @Column(name = "discount_amount", nullable = false)
    public Long discountAmount;

    @Column(name = "points_required", nullable = false)
    public Integer pointsRequired;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "is_active")
    public Boolean isActive = true;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    // Quan hệ 1-N: Một Coupon được nhiều User sở hữu
    @OneToMany(mappedBy = "coupon")
    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<UserCoupon> userCoupons;
}
