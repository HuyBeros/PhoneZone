package org.phonezone.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Username không được để trống")
    public String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    public String password;
}
