package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class CartItem extends PanacheEntity {

    // Quan hệ N-1: Giỏ hàng của User nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    public User user;

    // Quan hệ N-1: Sản phẩm nào trong giỏ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    public Product product;

    public Integer quantity = 1;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
