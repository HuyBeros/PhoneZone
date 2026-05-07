package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
public class OrderItem extends PanacheEntity {

    // Quan hệ N-1: Thuộc đơn hàng nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    public Order order;

    // Quan hệ N-1: Là sản phẩm nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    public Product product;

    @Column(nullable = false)
    public Integer quantity;

    @Column(name = "unit_price", nullable = false)
    public Long unitPrice;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
