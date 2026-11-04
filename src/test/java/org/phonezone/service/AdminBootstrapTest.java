package org.phonezone.service;

import io.quarkus.test.TestTransaction;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;
import org.phonezone.entity.User;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class AdminBootstrapTest {
    @Inject AdminBootstrap bootstrap;
    @Inject AuthService authService;

    void removeAdminRoles() {
        User.update("role = 'ROLE_USER' where role = 'ROLE_ADMIN'");
    }

    @Test @TestTransaction
    void createsHashedAdminOnceWithoutResettingPassword() {
        removeAdminRoles();
        bootstrap.createFirstAdmin("bootstrap_test", "bootstrap@example.invalid", "Test-only-password!");
        User admin = User.find("username", "bootstrap_test").firstResult();
        assertEquals("ROLE_ADMIN", admin.role);
        assertTrue(authService.verifyPassword("Test-only-password!", admin.passwordHash));
        bootstrap.createFirstAdmin("another_admin", "another@example.invalid", "Another-password!");
        assertEquals(1, User.count("role", "ROLE_ADMIN"));
        assertTrue(authService.verifyPassword("Test-only-password!", admin.passwordHash));
    }

    @Test @TestTransaction
    void rejectsWeakPasswordWithoutCreatingAnAccount() {
        removeAdminRoles();
        assertThrows(IllegalStateException.class, () ->
                bootstrap.createFirstAdmin("bootstrap_test", "bootstrap@example.invalid", "short"));
        assertEquals(0, User.count("username", "bootstrap_test"));
    }

    @Test @TestTransaction
    void doesNotPromoteAnExistingCustomer() {
        removeAdminRoles();
        User user = new User();
        user.username = "bootstrap_customer";
        user.email = "bootstrap_customer@example.invalid";
        user.passwordHash = authService.hashPassword("Customer-password!");
        user.persist();
        assertThrows(IllegalStateException.class, () -> bootstrap.createFirstAdmin(
                user.username, user.email, "Test-only-password!"));
        assertEquals("ROLE_USER", user.role);
    }
}
