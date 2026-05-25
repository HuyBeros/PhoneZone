package org.phonezone.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category extends PanacheEntity {

    @Column(nullable = false, unique = true)
    public String name;

    public String description;

    @Column(name = "created_at")
    public LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "category")
    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<Product> products;
}
