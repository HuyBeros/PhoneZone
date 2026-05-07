package org.phonezone.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    public String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    public String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải ít nhất 6 ký tự")
    public String password;

    @NotBlank(message = "Họ tên không được để trống")
    public String fullName;

    public String phone;
}
