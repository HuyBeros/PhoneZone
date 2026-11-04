package org.phonezone.service;

import io.smallrye.jwt.build.Jwt;
import io.quarkus.elytron.security.common.BcryptUtil;
import java.nio.charset.StandardCharsets;
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
    @Transactional
    public String login(LoginRequest request) {
        User user = User.find("username", request.username).firstResult();
        if (user == null) {
            return null;
        }

        // So sánh hash
        if (!verifyPassword(request.password, user.passwordHash)) {
            return null;
        }

        // Upgrade legacy SHA-256 after a valid login without changing the password.
        if (!user.passwordHash.startsWith("$2") && request.password.getBytes(StandardCharsets.UTF_8).length <= 72) {
            user.passwordHash = hashPassword(request.password);
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
     * Salted password hash for new and upgraded credentials.
     */
    public String hashPassword(String password) {
        if (password == null || password.length() < 6 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new jakarta.ws.rs.BadRequestException("Mật khẩu phải từ 6 ký tự và tối đa 72 byte UTF-8");
        }
        return BcryptUtil.bcryptHash(password);
    }

    public boolean verifyPassword(String password, String storedHash) {
        if (password == null || storedHash == null) return false;
        if (storedHash.startsWith("$2")) {
            if (password.getBytes(StandardCharsets.UTF_8).length > 72) return false;
            return BcryptUtil.matches(password, storedHash);
        }
        if (!storedHash.matches("[a-fA-F0-9]{64}")) return false;
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return MessageDigest.isEqual(md.digest(password.getBytes(StandardCharsets.UTF_8)), HexFormat.of().parseHex(storedHash));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 không khả dụng", e);
        }
    }
}
