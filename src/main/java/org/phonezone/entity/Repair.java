package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "repairs")
public class Repair extends PanacheEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @Column(name = "customer_name", nullable = false)
    public String customerName;

    @Column(name = "customer_phone", nullable = false)
    public String customerPhone;

    @Column(name = "customer_email")
    public String customerEmail;

    @Column(name = "device_type", nullable = false)
    public String deviceType; // iPhone, Samsung, Xiaomi, etc.

    @Column(name = "device_model", nullable = false)
    public String deviceModel; // iPhone 13 Pro, Galaxy S21, etc.

    @Column(name = "issue_description", nullable = false, length = 1000)
    public String issueDescription;

    @Column(name = "repair_service", nullable = false)
    public String repairService; // Thay màn hình, Thay pin, Sửa camera, etc.

    @Column(name = "estimated_cost")
    public Long estimatedCost;

    @Column(name = "status", nullable = false)
    public String status = "PENDING"; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "priority")
    public String priority = "NORMAL"; // NORMAL, URGENT

    @Column(name = "appointment_date")
    public LocalDateTime appointmentDate;

    @Column(name = "completion_date")
    public LocalDateTime completionDate;

    @Column(name = "technician_notes", length = 1000)
    public String technicianNotes;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    public LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
