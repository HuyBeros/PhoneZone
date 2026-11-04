package org.phonezone.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @Size(max = 100) public String fullName;
    @Size(max = 20) public String phone;
    @Size(max = 1000) public String address;

    @Size(min = 6, message = "Mật khẩu mới phải ít nhất 6 ký tự")
    public String newPassword;
}
