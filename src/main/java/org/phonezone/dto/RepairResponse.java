package org.phonezone.dto;

import org.phonezone.entity.Repair;
import java.time.LocalDateTime;

public class RepairResponse {
    public Long id;
    public String customerName;
    public String customerPhone;
    public String customerEmail;
    public String deviceType;
    public String deviceModel;
    public String issueDescription;
    public String repairService;
    public Long estimatedCost;
    public String status;
    public String priority;
    public LocalDateTime appointmentDate;
    public LocalDateTime completionDate;
    public String technicianNotes;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public static RepairResponse from(Repair repair) {
        RepairResponse response = new RepairResponse();
        response.id = repair.id;
        response.customerName = repair.customerName;
        response.customerPhone = repair.customerPhone;
        response.customerEmail = repair.customerEmail;
        response.deviceType = repair.deviceType;
        response.deviceModel = repair.deviceModel;
        response.issueDescription = repair.issueDescription;
        response.repairService = repair.repairService;
        response.estimatedCost = repair.estimatedCost;
        response.status = repair.status;
        response.priority = repair.priority;
        response.appointmentDate = repair.appointmentDate;
        response.completionDate = repair.completionDate;
        response.technicianNotes = repair.technicianNotes;
        response.createdAt = repair.createdAt;
        response.updatedAt = repair.updatedAt;
        return response;
    }
}
