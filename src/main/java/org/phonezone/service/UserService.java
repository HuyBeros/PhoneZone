package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.phonezone.dto.UpdateProfileRequest;
import org.phonezone.entity.User;

@ApplicationScoped
public class UserService {

    @Inject
    AuthService authService;

    /**
     * Lấy thông tin user theo username (từ JWT).
     */
    public User getUserByUsername(String username) {
        return User.find("username", username).firstResult();
    }

    /**
     * Cập nhật hồ sơ user.
     */
    @Transactional
    public User updateProfile(String username, UpdateProfileRequest request) {
        User user = User.find("username", username).firstResult();
        if (user == null) {
            return null;
        }

        if (request.fullName != null && !request.fullName.isBlank()) {
            user.fullName = request.fullName;
        }
        if (request.phone != null) {
            user.phone = request.phone;
        }
        if (request.address != null) {
            user.address = request.address;
        }
        if (request.newPassword != null && !request.newPassword.isBlank()) {
            user.passwordHash = authService.hashPassword(request.newPassword);
        }

        user.persist();
        return user;
    }
}
