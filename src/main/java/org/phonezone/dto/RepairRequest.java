package org.phonezone.dto;

import java.time.LocalDateTime;

public class RepairRequest {
    public String customerName;
    public String customerPhone;
    public String customerEmail;
    public String deviceType;
    public String deviceModel;
    public String issueDescription;
    public String repairService;
    public String priority;
    public LocalDateTime appointmentDate;
}
