package org.phonezone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminUserDto {
    public Long id;

    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50, message = "Username từ 3 đến 50 ký tự")
    public String username;

    // Cho phép email trống hoặc null; nếu có giá trị thì phải đúng định dạng
    @Pattern(
        regexp = "^$|^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$",
        message = "Email không hợp lệ"
    )
    public String email;

    public String fullName;
    public String phone;
    public String address;

    @NotBlank(message = "Role không được để trống")
    public String role;

    public Integer rewardPoints;

    public String newPassword; // Để admin có thể set password mới
}

