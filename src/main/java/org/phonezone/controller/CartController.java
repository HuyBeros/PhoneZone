package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.phonezone.dto.CartItemRequest;
import org.phonezone.dto.CartItemResponse;
import org.phonezone.entity.CartItem;
import org.phonezone.service.CartService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api/cart")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class CartController {

    @Inject
    JsonWebToken jwt;

    @Inject
    CartService cartService;

    @GET
    public Response getCart() {
        String username = jwt.getName();
        List<CartItem> items = cartService.getCartItems(username);
        List<CartItemResponse> responseList = items.stream()
                .map(CartItemResponse::from)
                .collect(Collectors.toList());

        long cartTotal = responseList.stream().mapToLong(i -> i.itemTotal != null ? i.itemTotal : 0).sum();
        long cartCount = responseList.stream().mapToLong(i -> i.quantity).sum();

        return Response.ok(Map.of(
                "items", responseList,
                "cartTotal", cartTotal,
                "cartCount", cartCount
        )).build();
    }

    @POST
    public Response addToCart(@Valid CartItemRequest request) {
        String username = jwt.getName();
        CartItem item = cartService.addToCart(username, request);
        
        if (item == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Sản phẩm không tồn tại hoặc lỗi xác thực"))
                    .build();
        }
        return Response.ok(CartItemResponse.from(item)).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateQuantity(@PathParam("id") Long cartItemId, @QueryParam("qty") int quantity) {
        String username = jwt.getName();
        CartItem item = cartService.updateCartItemQuantity(username, cartItemId, quantity);
        
        if (item == null) {
            // qty <= 0 triggers deletion, so returning empty success
            return Response.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng")).build();
        }
        return Response.ok(CartItemResponse.from(item)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response removeItem(@PathParam("id") Long cartItemId) {
        String username = jwt.getName();
        boolean removed = cartService.removeCartItem(username, cartItemId);
        
        if (!removed) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Sản phẩm không có trong giỏ hàng"))
                    .build();
        }
        return Response.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng")).build();
    }

    @DELETE
    public Response clearCart() {
        String username = jwt.getName();
        cartService.clearCart(username);
        return Response.ok(Map.of("message", "Đã dọn dẹp giỏ hàng")).build();
    }
}
