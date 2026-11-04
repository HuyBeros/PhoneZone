package org.phonezone.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/** Public catalog only. Admin, cart and checkout continue to read the database directly. */
@ApplicationScoped
public class ProductCatalogService {
    @Inject ProductService products;
    @Inject ProductCatalogCache cache;
    @Inject ObjectMapper mapper;

    public JsonNode list(String brand, String category, Long minPrice, Long maxPrice,
            String sort, int page, int size, String keyword) {
        ProductService.validateQuery(minPrice, maxPrice, page, size);
        return cache.getOrLoad("list", new Object[]{brand, category, minPrice, maxPrice, sort, page, size, keyword},
                () -> mapper.valueToTree(products.getProducts(brand, category, minPrice, maxPrice, sort, page, size, keyword, false)));
    }

    public JsonNode detail(Long id) {
        return cache.getOrLoad("detail", new Object[]{id}, () -> {
            var product = products.getProductById(id);
            return product == null ? null : mapper.valueToTree(product);
        });
    }

    public JsonNode search(String keyword, int limit) {
        ProductService.validateSearchLimit(limit);
        return cache.getOrLoad("search", new Object[]{keyword, limit},
                () -> mapper.valueToTree(products.searchProducts(keyword, limit)));
    }

    public JsonNode brands() {
        return cache.getOrLoad("brands", new Object[]{}, () -> mapper.valueToTree(products.getAllBrands()));
    }
}
