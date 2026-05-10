package org.phonezone.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.entity.Product;
import org.phonezone.service.ProductService;

import java.util.Map;

@Path("/api/admin/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ROLE_ADMIN")
public class AdminProductController {

    @Inject
    ProductService productService;

    @POST
    public Response createProduct(@Valid Product product) {
        Product created = productService.createProduct(product);
        return Response.status(Response.Status.CREATED)
                .entity(Map.of("message", "Thêm sản phẩm thành công", "product", created))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Response updateProduct(@PathParam("id") Long id, @Valid Product product) {
        Product updated = productService.updateProduct(id, product);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Sản phẩm không tồn tại"))
                    .build();
        }
        return Response.ok(Map.of("message", "Cập nhật sản phẩm thành công", "product", updated)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteProduct(@PathParam("id") Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (!deleted) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Sản phẩm không tồn tại"))
                    .build();
        }
        return Response.ok(Map.of("message", "Xóa sản phẩm thành công")).build();
    }
}
