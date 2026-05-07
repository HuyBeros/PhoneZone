package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product extends PanacheEntity {

    @Column(name = "ten_san_pham", nullable = false, columnDefinition = "TEXT")
    public String tenSanPham;

    @Column(name = "gia_ban")
    public String giaBan;

    @Column(name = "gia_ban_so")
    public Long giaBanSo = 0L;

    @Column(name = "gia_goc")
    public String giaGoc;

    @Column(name = "gia_goc_so")
    public Long giaGocSo = 0L;

    @Column(columnDefinition = "TEXT")
    public String link;

    @Column(name = "hinh_anh", columnDefinition = "TEXT")
    public String hinhAnh;

    @Column(name = "danh_muc")
    public String danhMuc;

    @Column(name = "thoi_gian_cao")
    public LocalDateTime thoiGianCao;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "thong_so", columnDefinition = "jsonb")
    public String thongSo;

    @Column(name = "stock_quantity")
    public Integer stockQuantity = 100;

    @Column(name = "is_active")
    public Boolean isActive = true;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    // Quan hệ N-1 với Category (qua tên danh mục)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    public Category category;
}
