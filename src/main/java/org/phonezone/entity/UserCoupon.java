package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_coupons")
public class UserCoupon extends PanacheEntity {

    // Quan hệ N-1: Thuộc về User nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    public User user;

    // Quan hệ N-1: Là Coupon nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    public Coupon coupon;

    @Column(length = 20)
    public String status = "UNUSED";

    @Column(name = "acquired_at")
    public LocalDateTime acquiredAt = LocalDateTime.now();

    @Column(name = "used_at")
    public LocalDateTime usedAt;
}
