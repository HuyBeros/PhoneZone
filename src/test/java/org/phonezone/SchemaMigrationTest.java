package org.phonezone;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import jakarta.inject.Inject;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.phonezone.entity.Product;
import org.phonezone.entity.User;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@TestProfile(SchemaMigrationTest.MigrationProfile.class)
class SchemaMigrationTest {
    public static class MigrationProfile implements QuarkusTestProfile {
        @Override public Map<String, String> getConfigOverrides() {
            // Only the disposable TEST_DB_* datasource from src/test/resources is used.
            return Map.of("quarkus.flyway.migrate-at-start", "true",
                    "quarkus.flyway.clean-at-start", "true",
                    "quarkus.flyway.clean-disabled", "false",
                    "quarkus.hibernate-orm.schema-management.strategy", "validate");
        }
    }

    @Inject Flyway flyway;

    @Test void migratesEmptySchemaAndStartsWithoutDemoAccounts() {
        assertEquals("1", flyway.info().current().getVersion().toString());
        assertEquals(0, User.count());
        assertEquals(0, Product.count());
        assertEquals(0, flyway.migrate().migrationsExecuted, "Restart must not rerun the baseline");
        assertTrue(flyway.validateWithResult().validationSuccessful);
        io.restassured.RestAssured.given().get("/api/health").then().statusCode(200)
                .body("status", org.hamcrest.Matchers.equalTo("UP"));
    }
}
