package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.phonezone.dto.CouponResponse;
import org.phonezone.entity.Coupon;
import org.phonezone.entity.User;
import org.phonezone.entity.UserCoupon;
import org.phonezone.service.RewardService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api/rewards")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RewardController {

    @Inject
    JsonWebToken jwt;

    @Inject
    RewardService rewardService;

    @GET
    @Path("/points")
    @Authenticated
    public Response getMyPoints() {
        String username = jwt.getName();
        User user = User.find("username", username).firstResult();
        if (user == null) {
            return Response.status(404).build();
        }
        return Response.ok(Map.of("points", user.rewardPoints)).build();
    }

    @GET
    @Path("/coupons/available")
    public Response getAvailableCoupons() {
        List<Coupon> coupons = rewardService.getAllActiveCoupons();
        List<CouponResponse> responseList = coupons.stream()
                .map(CouponResponse::from)
                .collect(Collectors.toList());
        return Response.ok(responseList).build();
    }

    @GET
    @Path("/coupons/my")
    @Authenticated
    public Response getMyCoupons() {
        String username = jwt.getName();
        List<UserCoupon> userCoupons = rewardService.getUserCoupons(username);
        
        List<Map<String, Object>> result = userCoupons.stream().map(uc -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", uc.id);
            map.put("code", uc.coupon.code);
            map.put("discountAmount", uc.coupon.discountAmount);
            map.put("description", uc.coupon.description);
            map.put("status", uc.status);
            map.put("acquiredAt", uc.acquiredAt);
            return map;
        }).collect(Collectors.toList());

        return Response.ok(result).build();
    }

    @POST
    @Path("/redeem/{couponId}")
    @Authenticated
    public Response redeemCoupon(@PathParam("couponId") Long couponId) {
        try {
            String username = jwt.getName();
            UserCoupon uc = rewardService.redeemCoupon(username, couponId);
            
            if (uc == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Coupon không tồn tại hoặc không hợp lệ"))
                        .build();
            }

            return Response.ok(Map.of(
                    "message", "Đổi coupon thành công!",
                    "coupon", CouponResponse.from(uc.coupon)
            )).build();
            
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
}
