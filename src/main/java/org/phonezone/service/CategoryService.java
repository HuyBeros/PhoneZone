package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.phonezone.entity.Category;

import java.util.List;

@ApplicationScoped
public class CategoryService {

    public List<Category> getAllCategories() {
        return Category.listAll();
    }

    public Category getCategoryById(Long id) {
        return Category.findById(id);
    }
}
