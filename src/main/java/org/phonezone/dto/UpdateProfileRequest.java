package org.phonezone.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    public String fullName;
    public String phone;
    public String address;

    @Size(min = 6, message = "Mật khẩu mới phải ít nhất 6 ký tự")
    public String newPassword;
}
