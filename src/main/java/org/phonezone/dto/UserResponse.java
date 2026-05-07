package org.phonezone.dto;

public class UserResponse {

    public Long id;
    public String username;
    public String email;
    public String fullName;
    public String phone;
    public String address;
    public String role;
    public Integer rewardPoints;

    public UserResponse() {}

    public static UserResponse from(org.phonezone.entity.User user) {
        UserResponse dto = new UserResponse();
        dto.id = user.id;
        dto.username = user.username;
        dto.email = user.email;
        dto.fullName = user.fullName;
        dto.phone = user.phone;
        dto.address = user.address;
        dto.role = user.role;
        dto.rewardPoints = user.rewardPoints;
        return dto;
    }
}
