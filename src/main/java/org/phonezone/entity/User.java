package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    @Column(unique = true, nullable = false, length = 50)
    public String username;

    @Column(name = "password_hash", nullable = false)
    public String passwordHash;

    @Column(unique = true, length = 100)
    public String email;

    @Column(name = "full_name", length = 100)
    public String fullName;

    @Column(length = 20)
    public String phone;

    @Column(columnDefinition = "TEXT")
    public String address;

    @Column(length = 20)
    public String role = "ROLE_USER";

    @Column(name = "reward_points")
    public Integer rewardPoints = 0;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    // Quan hệ 1-N: Một User có nhiều đơn hàng
    @OneToMany(mappedBy = "user")
    public List<Order> orders;

    // Quan hệ 1-N: Một User có nhiều item trong giỏ hàng
    @OneToMany(mappedBy = "user")
    public List<CartItem> cartItems;

    // Quan hệ 1-N: Một User sở hữu nhiều coupon
    @OneToMany(mappedBy = "user")
    public List<UserCoupon> userCoupons;
}
