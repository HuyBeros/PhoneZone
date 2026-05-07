package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.phonezone.dto.RepairRequest;
import org.phonezone.dto.RepairResponse;
import org.phonezone.entity.Repair;
import org.phonezone.entity.RepairServiceEntity;
import org.phonezone.entity.User;
import org.phonezone.service.RepairService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api/repairs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RepairController {

    @Inject
    RepairService repairService;

    // Lấy danh sách các dịch vụ sửa chữa có sẵn
    @GET
    @Path("/services")
    @PermitAll
    public Response getRepairServices() {
        List<RepairServiceEntity> services = RepairServiceEntity.listAll();
        return Response.ok(services).build();
    }

    // Lấy bảng giá dịch vụ
    @GET
    @Path("/prices")
    @PermitAll
    public Response getServicePrices() {
        Map<String, Long> prices = repairService.getServicePrices();
        return Response.ok(prices).build();
    }

    // Tạo yêu cầu sửa chữa mới (cho cả guest và user đã đăng nhập)
    @POST
    @PermitAll
    public Response createRepair(RepairRequest request, @Context SecurityContext securityContext) {
        User user = null;
        
        // Nếu user đã đăng nhập, lấy thông tin user
        if (securityContext.getUserPrincipal() != null) {
            String username = securityContext.getUserPrincipal().getName();
            user = User.find("username", username).firstResult();
        }
        
        Repair repair = repairService.createRepair(request, user);
        return Response.status(Response.Status.CREATED)
                .entity(RepairResponse.from(repair))
                .build();
    }

    // Lấy danh sách yêu cầu sửa chữa của user hiện tại
    @GET
    @Path("/my-repairs")
    @Authenticated
    public Response getMyRepairs(@Context SecurityContext securityContext) {
        String username = securityContext.getUserPrincipal().getName();
        User user = User.find("username", username).firstResult();
        
        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "User not found"))
                    .build();
        }
        
        List<Repair> repairs = repairService.getUserRepairs(user);
        List<RepairResponse> response = repairs.stream()
                .map(RepairResponse::from)
                .collect(Collectors.toList());
        
        return Response.ok(response).build();
    }

    // Lấy chi tiết 1 yêu cầu sửa chữa
    @GET
    @Path("/{id}")
    @PermitAll
    public Response getRepairById(@PathParam("id") Long id) {
        Repair repair = repairService.getRepairById(id);
        
        if (repair == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Repair not found"))
                    .build();
        }
        
        return Response.ok(RepairResponse.from(repair)).build();
    }

    // Cập nhật trạng thái yêu cầu sửa chữa (Admin only)
    @PUT
    @Path("/{id}/status")
    @Authenticated
    public Response updateRepairStatus(
            @PathParam("id") Long id,
            Map<String, String> updateData,
            @Context SecurityContext securityContext) {
        
        // Kiểm tra quyền admin
        if (!securityContext.isUserInRole("ROLE_ADMIN")) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Admin access required"))
                    .build();
        }
        
        String status = updateData.get("status");
        String technicianNotes = updateData.get("technicianNotes");
        
        Repair repair = repairService.updateRepairStatus(id, status, technicianNotes);
        
        if (repair == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Repair not found"))
                    .build();
        }
        
        return Response.ok(RepairResponse.from(repair)).build();
    }

    // Hủy yêu cầu sửa chữa
    @DELETE
    @Path("/{id}")
    @Authenticated
    public Response cancelRepair(@PathParam("id") Long id, @Context SecurityContext securityContext) {
        Repair repair = repairService.getRepairById(id);
        
        if (repair == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Repair not found"))
                    .build();
        }
        
        // Kiểm tra quyền: chỉ user sở hữu hoặc admin mới được hủy
        String username = securityContext.getUserPrincipal().getName();
        User currentUser = User.find("username", username).firstResult();
        
        boolean isOwner = repair.user != null && repair.user.id.equals(currentUser.id);
        boolean isAdmin = securityContext.isUserInRole("ROLE_ADMIN");
        
        if (!isOwner && !isAdmin) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "You don't have permission to cancel this repair"))
                    .build();
        }
        
        repairService.cancelRepair(id);
        return Response.ok(Map.of("message", "Repair cancelled successfully")).build();
    }

    // Lấy tất cả yêu cầu sửa chữa (Admin only)
    @GET
    @Path("/admin/all")
    @Authenticated
    public Response getAllRepairs(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @Context SecurityContext securityContext) {
        
        if (!securityContext.isUserInRole("ROLE_ADMIN")) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Admin access required"))
                    .build();
        }
        
        List<Repair> repairs = repairService.getAllRepairs(page, size);
        List<RepairResponse> response = repairs.stream()
                .map(RepairResponse::from)
                .collect(Collectors.toList());
        
        return Response.ok(Map.of(
                "repairs", response,
                "total", repairService.countRepairs(),
                "page", page,
                "size", size
        )).build();
    }

    // Thống kê số lượng yêu cầu theo trạng thái (Admin only)
    @GET
    @Path("/admin/stats")
    @Authenticated
    public Response getRepairStats(@Context SecurityContext securityContext) {
        if (!securityContext.isUserInRole("ROLE_ADMIN")) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of("error", "Admin access required"))
                    .build();
        }
        
        return Response.ok(Map.of(
                "total", repairService.countRepairs(),
                "pending", repairService.countRepairsByStatus("PENDING"),
                "confirmed", repairService.countRepairsByStatus("CONFIRMED"),
                "inProgress", repairService.countRepairsByStatus("IN_PROGRESS"),
                "completed", repairService.countRepairsByStatus("COMPLETED"),
                "cancelled", repairService.countRepairsByStatus("CANCELLED")
        )).build();
    }
}
