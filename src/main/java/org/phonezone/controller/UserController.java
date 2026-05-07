package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.phonezone.dto.UpdateProfileRequest;
import org.phonezone.dto.UserResponse;
import org.phonezone.entity.User;
import org.phonezone.service.UserService;

import java.util.Map;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class UserController {

    @Inject
    JsonWebToken jwt;

    @Inject
    UserService userService;

    /**
     * Lấy thông tin cá nhân (yêu cầu đăng nhập).
     * GET /api/users/me
     * Header: Authorization: Bearer <token>
     */
    @GET
    @Path("/me")
    public Response getMyProfile() {
        String username = jwt.getName();
        User user = userService.getUserByUsername(username);
        if (user == null) {
            return Response.status(404)
                    .entity(Map.of("error", "Không tìm thấy tài khoản"))
                    .build();
        }
        return Response.ok(UserResponse.from(user)).build();
    }

    /**
     * Cập nhật thông tin cá nhân.
     * PUT /api/users/me
     * Body: { "fullName": "...", "phone": "...", "address": "..." }
     */
    @PUT
    @Path("/me")
    public Response updateMyProfile(@Valid UpdateProfileRequest request) {
        String username = jwt.getName();
        User user = userService.updateProfile(username, request);
        if (user == null) {
            return Response.status(404)
                    .entity(Map.of("error", "Không tìm thấy tài khoản"))
                    .build();
        }
        return Response.ok(Map.of(
                "message", "Cập nhật hồ sơ thành công!",
                "user", UserResponse.from(user)
        )).build();
    }
}
