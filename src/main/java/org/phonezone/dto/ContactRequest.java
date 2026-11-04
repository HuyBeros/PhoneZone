package org.phonezone.dto;

import jakarta.validation.constraints.*;

public class ContactRequest {
    @NotBlank @Size(max = 100) public String name;
    @NotBlank @Email @Size(max = 100) public String email;
    @Size(max = 20) public String phone;
    @Size(max = 100) public String service;
    @Size(max = 100) public String budget;
    @NotBlank @Size(max = 1000) public String message;
}
