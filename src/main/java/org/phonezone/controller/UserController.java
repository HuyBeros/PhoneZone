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

    /**
     * Đổi mật khẩu (yêu cầu xác nhận mật khẩu cũ).
     * PUT /api/users/me/password
     * Body: { "currentPassword": "...", "newPassword": "...", "confirmPassword": "..." }
     */
    @PUT
    @Path("/me/password")
    public Response changePassword(Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");
        String confirmPassword = body.get("confirmPassword");

        if (currentPassword == null || currentPassword.isBlank()) {
            return Response.status(400).entity(Map.of("error", "Vui lòng nhập mật khẩu hiện tại")).build();
        }
        if (newPassword == null || newPassword.isBlank()) {
            return Response.status(400).entity(Map.of("error", "Vui lòng nhập mật khẩu mới")).build();
        }
        if (!newPassword.equals(confirmPassword)) {
            return Response.status(400).entity(Map.of("error", "Mật khẩu mới và xác nhận không khớp")).build();
        }

        try {
            String username = jwt.getName();
            User user = userService.changePassword(username, currentPassword, newPassword);
            if (user == null) {
                return Response.status(404).entity(Map.of("error", "Không tìm thấy tài khoản")).build();
            }
            return Response.ok(Map.of("message", "Đổi mật khẩu thành công!")).build();
        } catch (IllegalArgumentException e) {
            return Response.status(400).entity(Map.of("error", e.getMessage())).build();
        }
    }
}

