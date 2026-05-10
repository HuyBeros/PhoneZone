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

    /**
     * Đổi mật khẩu với xác thực mật khẩu cũ.
     * @return User nếu thành công, null nếu không tìm thấy user,
     *         throw IllegalArgumentException nếu mật khẩu cũ sai hoặc mật khẩu mới không hợp lệ.
     */
    @Transactional
    public User changePassword(String username, String currentPassword, String newPassword) {
        User user = User.find("username", username).firstResult();
        if (user == null) return null;

        // Xác thực mật khẩu hiện tại
        String currentHash = authService.hashPassword(currentPassword);
        if (!currentHash.equals(user.passwordHash)) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        // Validate mật khẩu mới
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        user.passwordHash = authService.hashPassword(newPassword);
        user.persist();
        return user;
    }

    /**
     * Lấy danh sách tất cả user.
     */
    public java.util.List<User> getAllUsers() {
        return User.listAll();
    }

    /**
     * Admin tạo mới user.
     */
    @Transactional
    public User createAdminUser(org.phonezone.dto.AdminUserDto dto) {
        if (User.find("username", dto.username).firstResult() != null) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }

        // Convert blank email to null to avoid unique constraint violation
        String email = (dto.email != null && !dto.email.isBlank()) ? dto.email.trim() : null;

        // Check duplicate email if provided
        if (email != null && User.find("email", email).firstResult() != null) {
            throw new IllegalArgumentException("Email này đã được sử dụng");
        }

        User user = new User();
        user.username = dto.username;
        user.email    = email;
        user.fullName = dto.fullName;
        user.phone    = dto.phone;
        user.address  = dto.address;
        user.role     = dto.role != null ? dto.role : "ROLE_USER";
        user.rewardPoints = dto.rewardPoints != null ? dto.rewardPoints : 0;

        String rawPassword = (dto.newPassword != null && !dto.newPassword.isBlank()) ? dto.newPassword : "123456";
        user.passwordHash = authService.hashPassword(rawPassword);

        user.persist();
        return user;
    }

    /**
     * Admin cập nhật user.
     */
    @Transactional
    public User updateAdminUser(Long id, org.phonezone.dto.AdminUserDto dto) {
        User user = User.findById(id);
        if (user == null) {
            return null;
        }

        // Convert blank email to null
        if (dto.email != null) {
            user.email = dto.email.isBlank() ? null : dto.email.trim();
        }
        if (dto.fullName != null)    user.fullName = dto.fullName;
        if (dto.phone != null)       user.phone = dto.phone;
        if (dto.address != null)     user.address = dto.address;
        if (dto.role != null)        user.role = dto.role;
        if (dto.rewardPoints != null) user.rewardPoints = dto.rewardPoints;

        if (dto.newPassword != null && !dto.newPassword.isBlank()) {
            user.passwordHash = authService.hashPassword(dto.newPassword);
        }

        user.persist();
        return user;
    }

    /**
     * Admin xóa user.
     */
    @Transactional
    public boolean deleteUser(Long id) {
        return User.deleteById(id);
    }
}
