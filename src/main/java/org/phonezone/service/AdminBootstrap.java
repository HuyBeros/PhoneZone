package org.phonezone.service;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.phonezone.entity.User;

import java.util.Optional;

@ApplicationScoped
public class AdminBootstrap {
    @Inject AuthService authService;
    @ConfigProperty(name = "phonezone.bootstrap-admin.enabled") boolean enabled;
    @ConfigProperty(name = "phonezone.bootstrap-admin.username") String username;
    @ConfigProperty(name = "phonezone.bootstrap-admin.email") String email;
    @ConfigProperty(name = "phonezone.bootstrap-admin.password") Optional<String> password;

    @Transactional
    void onStart(@Observes StartupEvent event) {
        if (enabled) createFirstAdmin(username, email, password.orElse(""));
    }

    // Never resets or promotes an existing account during a restart.
    void createFirstAdmin(String username, String email, String password) {
        if (User.count("role", "ROLE_ADMIN") > 0) return;
        if (username == null || !username.matches("[a-zA-Z0-9_]{3,50}")
                || email == null || email.length() > 100 || !email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")
                || password == null || password.length() < 12) {
            throw new IllegalStateException("Admin bootstrap requires a valid username, email and password of at least 12 characters");
        }
        if (User.count("username = ?1 or email = ?2", username, email) > 0) {
            throw new IllegalStateException("Admin bootstrap identity already exists; choose another identity");
        }
        User admin = new User();
        admin.username = username;
        admin.email = email;
        admin.fullName = "Administrator";
        admin.passwordHash = authService.hashPassword(password);
        admin.role = "ROLE_ADMIN";
        admin.persist();
    }
}
