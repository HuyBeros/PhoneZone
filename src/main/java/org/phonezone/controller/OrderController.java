package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.phonezone.dto.OrderRequest;
import org.phonezone.dto.OrderResponse;
import org.phonezone.entity.Order;
import org.phonezone.service.OrderService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class OrderController {

    @Inject
    JsonWebToken jwt;

    @Inject
    OrderService orderService;

    @GET
    public Response getMyOrders() {
        String username = jwt.getName();
        List<Order> orders = orderService.getUserOrders(username);
        
        List<OrderResponse> responseList = orders.stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());

        return Response.ok(responseList).build();
    }

    @GET
    @Path("/{id}")
    public Response getOrderDetails(@PathParam("id") Long orderId) {
        String username = jwt.getName();
        Order order = orderService.getOrderDetails(username, orderId);
        
        if (order == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Không tìm thấy đơn hàng"))
                    .build();
        }

        return Response.ok(OrderResponse.from(order)).build();
    }

    @POST
    public Response createOrder(@Valid OrderRequest request) {
        try {
            String username = jwt.getName();
            Order order = orderService.createOrder(username, request);
            
            if (order == null) {
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }

            return Response.status(Response.Status.CREATED)
                    .entity(Map.of(
                            "message", "Đặt hàng thành công",
                            "order", OrderResponse.from(order)
                    ))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
}
