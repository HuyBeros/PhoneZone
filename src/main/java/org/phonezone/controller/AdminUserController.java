package org.phonezone.controller;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.dto.AdminUserDto;
import org.phonezone.dto.UserResponse;
import org.phonezone.entity.User;
import org.phonezone.service.UserService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Path("/api/admin/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ROLE_ADMIN")
public class AdminUserController {

    @Inject
    UserService userService;

    @GET
    public Response getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponse> dtos = users.stream().map(UserResponse::from).collect(Collectors.toList());
        return Response.ok(dtos).build();
    }

    @POST
    public Response createUser(@Valid AdminUserDto request) {
        try {
            User user = userService.createAdminUser(request);
            return Response.status(201)
                    .entity(Map.of("message", "Tạo tài khoản thành công", "user", UserResponse.from(user)))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(400)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (ConstraintViolationException e) {
            String msg = e.getConstraintViolations().stream()
                    .map(cv -> cv.getMessage())
                    .collect(Collectors.joining("; "));
            return Response.status(400)
                    .entity(Map.of("error", msg))
                    .build();
        } catch (Exception e) {
            String cause = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            if (cause != null && cause.contains("unique")) {
                return Response.status(400)
                        .entity(Map.of("error", "Username hoặc Email đã tồn tại"))
                        .build();
            }
            return Response.status(500)
                    .entity(Map.of("error", "Lỗi hệ thống: " + e.getMessage()))
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateUser(@PathParam("id") Long id, @Valid AdminUserDto request) {
        try {
            User user = userService.updateAdminUser(id, request);
            if (user == null) {
                return Response.status(404)
                        .entity(Map.of("error", "Không tìm thấy user"))
                        .build();
            }
            return Response.ok(Map.of("message", "Cập nhật thành công", "user", UserResponse.from(user))).build();
        } catch (IllegalArgumentException e) {
            return Response.status(400).entity(Map.of("error", e.getMessage())).build();
        } catch (Exception e) {
            String cause = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            if (cause != null && cause.contains("unique")) {
                return Response.status(400)
                        .entity(Map.of("error", "Email đã được sử dụng bởi tài khoản khác"))
                        .build();
            }
            return Response.status(500).entity(Map.of("error", "Lỗi hệ thống: " + e.getMessage())).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") Long id) {
        boolean deleted = userService.deleteUser(id);
        if (!deleted) {
            return Response.status(404)
                    .entity(Map.of("error", "Không tìm thấy user"))
                    .build();
        }
        return Response.ok(Map.of("message", "Xóa tài khoản thành công")).build();
    }
}

