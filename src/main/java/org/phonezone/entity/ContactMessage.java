package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
public class ContactMessage extends PanacheEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String email;

    public String phone;
    
    public String service;
    
    public String budget;

    @Column(nullable = false, length = 1000)
    public String message;

    @Column(name = "status")
    public String status = "NEW"; // NEW, READ, RESOLVED

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();
}
