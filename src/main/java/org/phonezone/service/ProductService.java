package org.phonezone.service;

import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import org.phonezone.entity.Product;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class ProductService {

    /**
     * Lấy danh sách sản phẩm có lọc, sắp xếp, phân trang.
     */
    public Map<String, Object> getProducts(String brand, String category, Long minPrice, Long maxPrice, String sort, int page, int size) {
        StringBuilder query = new StringBuilder("1=1");
        Map<String, Object> params = new HashMap<>();

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
        return Product.findById(id);
    }

    /**
     * Tìm kiếm sản phẩm theo từ khóa.
     */
    public List<Product> searchProducts(String keyword, int limit) {
        return Product
                .find("lower(tenSanPham) like :kw",
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
                .createQuery("SELECT DISTINCT p.danhMuc FROM Product p WHERE p.danhMuc IS NOT NULL ORDER BY p.danhMuc", String.class)
                .getResultList();
    }

    // --- ADMIN METHODS ---

    @jakarta.transaction.Transactional
    public Product createProduct(Product product) {
        product.persist();
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

        existing.persist();
        return existing;
    }

    @jakarta.transaction.Transactional
    public boolean deleteProduct(Long id) {
        return Product.deleteById(id);
    }

    @jakarta.transaction.Transactional
    public long deleteProducts(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return 0;
        return Product.delete("id in ?1", ids);
    }
}
