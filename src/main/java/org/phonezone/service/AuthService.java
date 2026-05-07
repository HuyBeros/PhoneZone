package org.phonezone.service;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.phonezone.dto.LoginRequest;
import org.phonezone.dto.RegisterRequest;
import org.phonezone.entity.User;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Set;

@ApplicationScoped
public class AuthService {

    /**
     * Đăng ký tài khoản mới.
     * @return User đã tạo, hoặc null nếu username/email đã tồn tại.
     */
    @Transactional
    public User register(RegisterRequest request) {
        // Kiểm tra username trùng
        if (User.find("username", request.username).firstResult() != null) {
            return null;
        }
        // Kiểm tra email trùng
        if (request.email != null && User.find("email", request.email).firstResult() != null) {
            return null;
        }

        User user = new User();
        user.username = request.username;
        user.email = request.email;
        user.passwordHash = hashPassword(request.password);
        user.fullName = request.fullName;
        user.phone = request.phone;
        user.role = "ROLE_USER";
        user.rewardPoints = 0;
        user.persist();

        return user;
    }

    /**
     * Đăng nhập – kiểm tra username + password, trả về JWT token.
     * @return JWT token string, hoặc null nếu sai thông tin.
     */
    public String login(LoginRequest request) {
        User user = User.find("username", request.username).firstResult();
        if (user == null) {
            return null;
        }

        // So sánh hash
        String inputHash = hashPassword(request.password);
        if (!inputHash.equals(user.passwordHash)) {
            return null;
        }

        // Tạo JWT token
        return generateToken(user);
    }

    /**
     * Tìm User theo username.
     */
    public User findByUsername(String username) {
        return User.find("username", username).firstResult();
    }

    /**
     * Tạo JWT token cho user.
     */
    private String generateToken(User user) {
        return Jwt.issuer("phonezone-issuer")
                .upn(user.username)
                .subject(user.id.toString())
                .groups(Set.of(user.role))
                .claim("fullName", user.fullName != null ? user.fullName : "")
                .claim("email", user.email != null ? user.email : "")
                .expiresIn(Duration.ofHours(24))
                .sign();
    }

    /**
     * Hash mật khẩu bằng SHA-256.
     */
    public String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 không khả dụng", e);
        }
    }
}
