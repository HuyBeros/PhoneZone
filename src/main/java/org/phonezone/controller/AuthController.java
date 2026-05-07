package org.phonezone.controller;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.dto.LoginRequest;
import org.phonezone.dto.RegisterRequest;
import org.phonezone.dto.UserResponse;
import org.phonezone.entity.User;
import org.phonezone.service.AuthService;

import java.util.Map;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {

    @Inject
    AuthService authService;

    /**
     * Đăng ký tài khoản.
     * POST /api/auth/register
     * Body: { "username": "abc", "email": "a@b.com", "password": "123456", "fullName": "Nguyen Van A" }
     */
    @POST
    @Path("/register")
    public Response register(@Valid RegisterRequest request) {
        User user = authService.register(request);
        if (user == null) {
            return Response.status(409)
                    .entity(Map.of("error", "Username hoặc email đã tồn tại"))
                    .build();
        }

        return Response.status(201)
                .entity(Map.of(
                    "message", "Đăng ký thành công!",
                    "user", UserResponse.from(user)
                ))
                .build();
    }

    /**
     * Đăng nhập.
     * POST /api/auth/login
     * Body: { "username": "abc", "password": "123456" }
     * Response: { "token": "eyJ...", "user": {...} }
     */
    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        String token = authService.login(request);
        if (token == null) {
            return Response.status(401)
                    .entity(Map.of("error", "Sai tên đăng nhập hoặc mật khẩu"))
                    .build();
        }

        User user = authService.findByUsername(request.username);

        return Response.ok(Map.of(
                "token", token,
                "user", UserResponse.from(user)
        )).build();
    }
}
