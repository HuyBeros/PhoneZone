package org.phonezone.service;

import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.phonezone.entity.Product;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class ProductService {
    @Inject ProductCatalogCache catalogCache;

    static void validateQuery(Long minPrice, Long maxPrice, int page, int size) {
        if (page < 0 || size < 1 || size > 200) throw new IllegalArgumentException("Trang phải >= 0 và số sản phẩm mỗi trang từ 1 đến 200");
        if ((minPrice != null && minPrice < 0) || (maxPrice != null && maxPrice < 0)
                || (minPrice != null && maxPrice != null && minPrice > maxPrice)) {
            throw new IllegalArgumentException("Khoảng giá không hợp lệ");
        }
    }

    static void validateSearchLimit(int limit) {
        if (limit < 1 || limit > 50) throw new IllegalArgumentException("Giới hạn tìm kiếm từ 1 đến 50");
    }

    /**
     * Lấy danh sách sản phẩm có lọc, sắp xếp, phân trang.
     */
    public Map<String, Object> getProducts(String brand, String category, Long minPrice, Long maxPrice, String sort, int page, int size) {
        return getProducts(brand, category, minPrice, maxPrice, sort, page, size, null, false);
    }

    public Map<String, Object> getProducts(String brand, String category, Long minPrice, Long maxPrice, String sort, int page, int size, String keyword, boolean admin) {
        validateQuery(minPrice, maxPrice, page, size);
        StringBuilder query = new StringBuilder(admin ? "1=1" : "isActive = true");
        Map<String, Object> params = new HashMap<>();

        if (keyword != null && !keyword.isBlank()) {
            query.append(" and (lower(tenSanPham) like :keyword or lower(danhMuc) like :keyword)");
            params.put("keyword", "%" + keyword.trim().toLowerCase(java.util.Locale.ROOT) + "%");
        }

        if (brand != null && !brand.isBlank()) {
            query.append(" and lower(danhMuc) like :brand");
            params.put("brand", "%" + brand.toLowerCase() + "%");
        }
        if (category != null && !category.isBlank()) {
            query.append(" and category.name = :category");
            params.put("category", category);
        }
        if (minPrice != null) {
            query.append(" and giaBanSo >= :minPrice");
            params.put("minPrice", minPrice);
        }
        if (maxPrice != null) {
            query.append(" and giaBanSo <= :maxPrice");
            params.put("maxPrice", maxPrice);
        }

        Sort sortObj;
        switch (sort) {
            case "price-asc":  sortObj = Sort.by("giaBanSo").ascending();  break;
            case "price-desc": sortObj = Sort.by("giaBanSo").descending(); break;
            case "name-asc":   sortObj = Sort.by("tenSanPham").ascending(); break;
            case "newest":     sortObj = Sort.by("id").descending();        break;
            default:           sortObj = Sort.by("id").ascending();         break;
        }

        List<Product> products = Product.find(query.toString(), sortObj, params)
                .page(Page.of(page, size))
                .list();

        long total = Product.count(query.toString(), params);

        Map<String, Object> result = new HashMap<>();
        result.put("data", products);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));

        return result;
    }

    /**
     * Lấy chi tiết sản phẩm theo ID.
     */
    public Product getProductById(Long id) {
        return Product.find("id = ?1 and isActive = true", id).firstResult();
    }

    /**
     * Tìm kiếm sản phẩm theo từ khóa.
     */
    public List<Product> searchProducts(String keyword, int limit) {
        validateSearchLimit(limit);
        return Product
                .find("isActive = true and lower(tenSanPham) like :kw",
                      Sort.by("giaBanSo").ascending(),
                      Map.of("kw", "%" + keyword.toLowerCase() + "%"))
                .page(Page.ofSize(limit))
                .list();
    }

    /**
     * Lấy danh sách các brand (distinct danh_muc).
     */
    public List<String> getAllBrands() {
        return Product.getEntityManager()
                .createQuery("SELECT DISTINCT p.danhMuc FROM Product p WHERE p.isActive = true AND p.danhMuc IS NOT NULL ORDER BY p.danhMuc", String.class)
                .getResultList();
    }

    // --- ADMIN METHODS ---

    @jakarta.transaction.Transactional
    public Product createProduct(Product product) {
        product.persist();
        catalogCache.invalidateAfterCommit();
        return product;
    }

    @jakarta.transaction.Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = Product.findById(id);
        if (existing == null) {
            return null;
        }
        
        existing.tenSanPham = updatedProduct.tenSanPham;
        existing.giaBanSo = updatedProduct.giaBanSo;
        existing.giaGocSo = updatedProduct.giaGocSo;
        existing.hinhAnh = updatedProduct.hinhAnh;
        existing.danhMuc = updatedProduct.danhMuc;
        existing.stockQuantity = updatedProduct.stockQuantity;
        existing.isActive = updatedProduct.isActive;

        // The admin response is serialized after this transaction closes.
        org.hibernate.Hibernate.initialize(existing.category);
        existing.persist();
        catalogCache.invalidateAfterCommit();
        return existing;
    }

    @jakarta.transaction.Transactional
    public boolean deleteProduct(Long id) {
        boolean deleted = Product.deleteById(id);
        if (deleted) catalogCache.invalidateAfterCommit();
        return deleted;
    }

    @jakarta.transaction.Transactional
    public long deleteProducts(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return 0;
        long deleted = Product.delete("id in ?1", ids);
        if (deleted > 0) catalogCache.invalidateAfterCommit();
        return deleted;
    }
}
