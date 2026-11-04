package org.phonezone.controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.fasterxml.jackson.databind.JsonNode;
import org.phonezone.service.ProductCatalogService;

import java.util.List;
import java.util.Map;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
public class ProductController {

    @Inject
    ProductCatalogService catalog;

    /**
     * Lấy danh sách sản phẩm – hỗ trợ lọc, sắp xếp, phân trang.
     * GET /api/products?brand=iPhone&minPrice=5000000&sort=price-asc&page=0&size=20
     */
    @GET
    public Response listProducts(
            @QueryParam("brand") String brand,
            @QueryParam("category") String category,
            @QueryParam("minPrice") Long minPrice,
            @QueryParam("maxPrice") Long maxPrice,
            @QueryParam("sort") @DefaultValue("default") String sort,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("100") int size,
            @QueryParam("q") String keyword
    ) {
        JsonNode result = catalog.list(brand, category, minPrice, maxPrice, sort, page, size, keyword);
        return Response.ok(result).build();
    }

    /**
     * Lấy chi tiết 1 sản phẩm.
     * GET /api/products/{id}
     */
    @GET
    @Path("/{id}")
    public Response getProduct(@PathParam("id") Long id) {
        JsonNode product = catalog.detail(id);
        if (product == null) {
            return Response.status(404)
                    .entity(Map.of("error", "Không tìm thấy sản phẩm với ID: " + id))
                    .build();
        }
        return Response.ok(product).build();
    }

    /**
     * Tìm kiếm sản phẩm theo tên.
     * GET /api/products/search?q=iphone&limit=10
     */
    @GET
    @Path("/search")
    public Response searchProducts(
            @QueryParam("q") String keyword,
            @QueryParam("limit") @DefaultValue("10") int limit
    ) {
        if (keyword == null || keyword.trim().length() < 2) {
            return Response.ok(List.of()).build();
        }
        JsonNode results = catalog.search(keyword, limit);
        return Response.ok(results).build();
    }

    /**
     * Lấy danh sách các brand.
     * GET /api/products/brands
     */
    @GET
    @Path("/brands")
    public Response getBrands() {
        JsonNode brands = catalog.brands();
        return Response.ok(brands).build();
    }
}
