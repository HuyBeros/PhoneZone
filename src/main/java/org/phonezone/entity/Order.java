package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order extends PanacheEntity {

    // Quan hệ N-1: Đơn hàng của User nào (có thể NULL nếu Guest mua)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    public User user;

    @Column(name = "customer_name", nullable = false, length = 100)
    public String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    public String customerPhone;

    @Column(name = "customer_email", length = 100)
    public String customerEmail;

    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    public String shippingAddress;

    @Column(name = "total_amount", nullable = false)
    public Long totalAmount;

    @Column(name = "discount_amount")
    public Long discountAmount = 0L;

    @Column(name = "final_amount", nullable = false)
    public Long finalAmount;

    @Column(name = "payment_method", length = 50)
    public String paymentMethod = "COD";

    @Column(length = 50)
    public String status = "PENDING";

    @Column(name = "earned_points")
    public Integer earnedPoints = 0;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    public LocalDateTime updatedAt = LocalDateTime.now();

    // Quan hệ 1-N: Một đơn hàng có nhiều chi tiết (sản phẩm)
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<OrderItem> orderItems;
}
