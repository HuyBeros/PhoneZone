package org.phonezone.dto;

import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

public class RepairRequest {
    @NotBlank @Size(max = 100) public String customerName;
    @NotBlank @Size(max = 20) public String customerPhone;
    @Email @Size(max = 100) public String customerEmail;
    @NotBlank @Size(max = 100) public String deviceType;
    @NotBlank @Size(max = 100) public String deviceModel;
    @NotBlank @Size(max = 1000) public String issueDescription;
    @NotBlank @Size(max = 100) public String repairService;
    @Pattern(regexp = "NORMAL|URGENT") public String priority;
    @Future public LocalDateTime appointmentDate;
}
