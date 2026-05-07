package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_services")
public class RepairServiceEntity extends PanacheEntity {

    @Column(name = "ten_dich_vu", nullable = false)
    public String tenDichVu;

    @Column(name = "gia_hien_thi")
    public String giaHienThi;

    @Column(name = "gia_so")
    public Long giaSo;

    @Column(name = "link")
    public String link;

    @Column(name = "thoi_gian_cao")
    public LocalDateTime thoiGianCao;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
