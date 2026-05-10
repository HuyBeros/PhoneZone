package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.entity.Coupon;
import org.phonezone.service.RewardService;

import java.util.Map;

@Path("/api/admin/coupons")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
// @RolesAllowed("admin") // Nếu có role admin thì bật, tạm thời dùng Authenticated
@Authenticated
public class AdminCouponController {

    @Inject
    RewardService rewardService;

    @GET
    public Response getAllCoupons() {
        return Response.ok(rewardService.getAllCoupons()).build();
    }

    @POST
    public Response createCoupon(Coupon coupon) {
        try {
            Coupon created = rewardService.createCoupon(coupon);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateCoupon(@PathParam("id") Long id, Coupon coupon) {
        try {
            Coupon updated = rewardService.updateCoupon(id, coupon);
            if (updated == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Không tìm thấy mã khuyến mãi"))
                        .build();
            }
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteCoupon(@PathParam("id") Long id) {
        boolean deleted = rewardService.deleteCoupon(id);
        if (deleted) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("error", "Không tìm thấy mã khuyến mãi"))
                .build();
    }
}
