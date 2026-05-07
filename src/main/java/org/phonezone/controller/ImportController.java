package org.phonezone.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.dto.ProductImportDto;
import org.phonezone.entity.Product;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Path("/api/import")
@Produces(MediaType.APPLICATION_JSON)
public class ImportController {

    @Inject
    ObjectMapper objectMapper;

    /**
     * Import sản phẩm từ file JSON vào database.
     * POST http://localhost:8080/api/import/products
     */
    @POST
    @Path("/products")
    @Transactional
    public Response importProducts() {
        try {
            File jsonFile = new File("mobilecity_20260427_120149.json");

            if (!jsonFile.exists()) {
                return Response.status(404)
                    .entity(Map.of("error", "Không tìm thấy file JSON: " + jsonFile.getAbsolutePath()))
                    .build();
            }

            List<ProductImportDto> dtos = objectMapper.readValue(
                jsonFile,
                new TypeReference<List<ProductImportDto>>() {}
            );

            int imported = 0;
            int skipped = 0;
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (ProductImportDto dto : dtos) {
                long exists = Product.count("tenSanPham", dto.tenSanPham);
                if (exists > 0) {
                    skipped++;
                    continue;
                }

                Product p = new Product();
                p.tenSanPham = dto.tenSanPham;
                p.giaBan = dto.giaBan;
                p.giaBanSo = dto.giaBanSo != null ? dto.giaBanSo : 0L;
                p.giaGoc = dto.giaGoc;
                p.giaGocSo = dto.giaGocSo != null ? dto.giaGocSo : 0L;
                p.link = dto.link;
                p.hinhAnh = dto.hinhAnh;
                p.danhMuc = dto.danhMuc;
                p.stockQuantity = 100;
                p.isActive = true;

                if (dto.thoiGianCao != null && !dto.thoiGianCao.isEmpty()) {
                    try {
                        p.thoiGianCao = LocalDateTime.parse(dto.thoiGianCao, fmt);
                    } catch (Exception e) {
                        p.thoiGianCao = null;
                    }
                }

                if (dto.thongSo != null) {
                    p.thongSo = objectMapper.writeValueAsString(dto.thongSo);
                }

                p.persist();
                imported++;
            }

            return Response.ok(Map.of(
                "message", "Import hoàn tất!",
                "imported", imported,
                "skipped", skipped,
                "total", dtos.size()
            )).build();

        } catch (Exception e) {
            return Response.serverError()
                .entity(Map.of("error", "Lỗi import: " + e.getMessage()))
                .build();
        }
    }

    /**
     * Xóa toàn bộ sản phẩm.
     * DELETE http://localhost:8080/api/import/products
     */
    @DELETE
    @Path("/products")
    @Transactional
    public Response clearProducts() {
        long deleted = Product.deleteAll();
        return Response.ok(Map.of(
            "message", "Đã xóa toàn bộ sản phẩm",
            "deleted", deleted
        )).build();
    }

    /**
     * Import máy tính bảng từ file JSON vào database.
     * POST http://localhost:8080/api/import/tablets
     */
    @POST
    @Path("/tablets")
    @Transactional
    public Response importTablets() {
        try {
            File jsonFile = new File("tablets.json");

            if (!jsonFile.exists()) {
                return Response.status(404)
                    .entity(Map.of("error", "Không tìm thấy file JSON: " + jsonFile.getAbsolutePath()))
                    .build();
            }

            List<ProductImportDto> dtos = objectMapper.readValue(
                jsonFile,
                new TypeReference<List<ProductImportDto>>() {}
            );

            // Tạo hoặc lấy category "Máy tính bảng"
            org.phonezone.entity.Category tabletCategory = org.phonezone.entity.Category.find("name", "Máy tính bảng").firstResult();
            if (tabletCategory == null) {
                tabletCategory = new org.phonezone.entity.Category();
                tabletCategory.name = "Máy tính bảng";
                tabletCategory.description = "Máy tính bảng các hãng";
                tabletCategory.persist();
            }

            int imported = 0;
            int skipped = 0;
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (ProductImportDto dto : dtos) {
                long exists = Product.count("tenSanPham", dto.tenSanPham);
                if (exists > 0) {
                    skipped++;
                    continue;
                }

                Product p = new Product();
                p.tenSanPham = dto.tenSanPham;
                p.giaBan = dto.giaBan;
                p.giaBanSo = dto.giaBanSo != null ? dto.giaBanSo : 0L;
                p.giaGoc = dto.giaGoc;
                p.giaGocSo = dto.giaGocSo != null ? dto.giaGocSo : 0L;
                p.link = dto.link;
                p.hinhAnh = dto.hinhAnh;
                p.danhMuc = dto.danhMuc;
                p.category = tabletCategory;
                p.stockQuantity = 50;
                p.isActive = true;

                if (dto.thoiGianCao != null && !dto.thoiGianCao.isEmpty()) {
                    try {
                        p.thoiGianCao = LocalDateTime.parse(dto.thoiGianCao, fmt);
                    } catch (Exception e) {
                        p.thoiGianCao = null;
                    }
                }

                if (dto.thongSo != null) {
                    p.thongSo = objectMapper.writeValueAsString(dto.thongSo);
                }

                p.persist();
                imported++;
            }

            return Response.ok(Map.of(
                "message", "Import máy tính bảng hoàn tất!",
                "imported", imported,
                "skipped", skipped,
                "total", dtos.size()
            )).build();

        } catch (Exception e) {
            return Response.serverError()
                .entity(Map.of("error", "Lỗi import tablets: " + e.getMessage()))
                .build();
        }
    }
}
