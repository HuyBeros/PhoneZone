package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.dto.OrderResponse;
import org.phonezone.entity.Order;
import org.phonezone.service.OrderService;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api/admin/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ROLE_ADMIN")
public class AdminOrderController {

    @Inject
    OrderService orderService;

    @GET
    @Transactional
    public Response getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<OrderResponse> dtos = orders.stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
        return Response.ok(dtos).build();
    }

    @PUT
    @Path("/{id}/status")
    @Transactional
    public Response updateStatus(@PathParam("id") Long id, Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return Response.status(400).entity(Map.of("error", "Status is required")).build();
        }

        Order order = orderService.updateOrderStatus(id, status);
        if (order == null) {
            return Response.status(404).entity(Map.of("error", "Order not found")).build();
        }

        return Response.ok(OrderResponse.from(order)).build();
    }
}
