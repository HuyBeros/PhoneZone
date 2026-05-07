package org.phonezone.controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.entity.Category;
import org.phonezone.service.CategoryService;

import java.util.Map;

@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
public class CategoryController {

    @Inject
    CategoryService categoryService;

    /**
     * Lấy danh sách tất cả danh mục.
     * GET /api/categories
     */
    @GET
    public Response listCategories() {
        return Response.ok(categoryService.getAllCategories()).build();
    }

    /**
     * Lấy chi tiết 1 danh mục.
     * GET /api/categories/{id}
     */
    @GET
    @Path("/{id}")
    public Response getCategory(@PathParam("id") Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category == null) {
            return Response.status(404)
                    .entity(Map.of("error", "Không tìm thấy danh mục"))
                    .build();
        }
        return Response.ok(category).build();
    }
}
