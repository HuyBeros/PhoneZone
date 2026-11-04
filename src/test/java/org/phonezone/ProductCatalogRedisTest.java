package org.phonezone;

import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.phonezone.entity.*;
import org.phonezone.service.ProductCatalogCache;
import org.phonezone.service.ProductService;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@TestProfile(ProductCatalogRedisTest.RedisProfile.class)
class ProductCatalogRedisTest {
    public static class RedisProfile implements QuarkusTestProfile {
        static final String NAMESPACE = "phonezone:catalog:integration:" + UUID.randomUUID();
        @Override public Map<String, String> getConfigOverrides() {
            return Map.of("phonezone.catalog-cache.enabled", "true",
                    "phonezone.catalog-cache.namespace", NAMESPACE,
                    "phonezone.catalog-cache.retry-delay", "0s",
                    "phonezone.catalog-cache.ttl", "60s");
        }
    }

    @Inject RedisDataSource redis;
    @Inject ProductCatalogCache cache;
    @Inject ProductService products;
    @Inject @ConfigProperty(name = "phonezone.catalog-cache.namespace") String namespace;
    private long productId, hiddenId;
    private String admin, customer;

    @BeforeEach void fixtures() {
        // application.properties points exclusively at the disposable phonezone_test database.
        assertEquals("PONG", redis.execute("PING").toString(), "Start the isolated test Redis on localhost:6380");
        QuarkusTransaction.requiringNew().run(() -> {
            OrderItem.deleteAll(); Order.deleteAll(); CartItem.deleteAll(); UserCoupon.deleteAll();
            Repair.deleteAll(); User.deleteAll(); Product.deleteAll(); Category.deleteAll();
            User owner = new User(); owner.username = "cache_customer"; owner.email = "cache@example.invalid";
            owner.fullName = "Cache test customer"; owner.passwordHash = "unused-test-only";
            owner.role = "ROLE_USER"; owner.rewardPoints = 0; owner.persist();
            customer = Jwt.issuer("phonezone-issuer").upn(owner.username).subject(owner.id.toString())
                    .groups(Set.of("ROLE_USER")).expiresIn(600).sign();
            admin = Jwt.issuer("phonezone-issuer").upn("cache_admin").groups(Set.of("ROLE_ADMIN")).expiresIn(600).sign();
            Category category = new Category(); category.name = "Cache category"; category.description = "Test category";
            category.persist();
            Product product = new Product(); product.tenSanPham = "Cache phone"; product.danhMuc = "Cache brand";
            product.giaBanSo = 100000L; product.stockQuantity = 5; product.category = category;
            product.thongSo = "{\"RAM\":\"8GB\"}"; product.persist(); productId = product.id;
            Product hidden = new Product(); hidden.tenSanPham = "Hidden cache phone"; hidden.danhMuc = "Private brand";
            hidden.isActive = false; hidden.persist(); hiddenId = hidden.id;
        });
        cache.invalidateAfterCommit();
    }

    private String path() { return "/api/products/" + productId; }
    private String generation() { return redis.value(String.class).get(namespace + ":generation"); }
    private Map<String, Object> edit(String name, long price, boolean active) {
        return Map.of("tenSanPham", name, "giaBanSo", price, "giaGocSo", 120000L,
                "danhMuc", "Updated brand", "stockQuantity", 5, "isActive", active, "hinhAnh", "/cache-test.png");
    }
    private void warmCatalog() {
        given().get(path()).then().statusCode(200);
        given().queryParam("size", 20).get("/api/products").then().statusCode(200);
        given().queryParam("q", "Cache").get("/api/products/search").then().statusCode(200);
        given().get("/api/products/brands").then().statusCode(200);
    }

    @Test void cacheHitsPreserveThePublicJsonContractAndDoNotQueryFreshRows() {
        String first = given().get(path()).then().statusCode(200)
                .body("category.name", equalTo("Cache category"), "thongSo", allOf(containsString("RAM"), containsString("8GB")))
                .extract().asString();
        // Deliberate out-of-band database edit proves the second request is a real Redis hit.
        QuarkusTransaction.requiringNew().run(() -> Product.<Product>findById(productId).tenSanPham = "Database changed");
        assertEquals(first, given().get(path()).then().statusCode(200).extract().asString());
        assertFalse(redis.key().keys(namespace + ":*:detail:*").isEmpty());
        cache.invalidateAfterCommit();
        given().get(path()).then().statusCode(200).body("tenSanPham", equalTo("Database changed"));
    }

    @Test void filterPaginationAndSearchLimitRemainDistinctAndValidationStillRuns() {
        given().queryParam("size", 1).get("/api/products").then().statusCode(200)
                .body("size", equalTo(1), "total", equalTo(1), "data.size()", equalTo(1));
        given().queryParam("size", 1).queryParam("page", 1).get("/api/products").then().statusCode(200).body("data", empty());
        given().queryParam("brand", "Private").get("/api/products").then().statusCode(200).body("data", empty());
        given().queryParam("minPrice", 100001).get("/api/products").then().statusCode(200).body("data", empty());
        given().queryParam("category", "Cache category").get("/api/products").then().statusCode(200).body("total", equalTo(1));
        given().queryParam("q", "Cache").queryParam("limit", 1).get("/api/products/search").then().statusCode(200).body("size()", equalTo(1));
        given().queryParam("q", "Cache").queryParam("limit", 0).get("/api/products/search").then().statusCode(400);
        given().queryParam("size", 201).get("/api/products").then().statusCode(400);
        given().queryParam("minPrice", 10).queryParam("maxPrice", 1).get("/api/products").then().statusCode(400);
    }

    @Test void successfulUpdatesInvalidateDetailListSearchAndBrandsAndKeepHiddenProductsPrivate() {
        warmCatalog();
        String before = generation();
        given().auth().oauth2(admin).contentType("application/json").body(edit("Updated phone", 110000L, true))
                .put(path().replace("/products/", "/admin/products/")).then().statusCode(200);
        assertNotEquals(before, generation());
        given().get(path()).then().statusCode(200).body("tenSanPham", equalTo("Updated phone"), "giaBanSo", equalTo(110000));
        given().queryParam("size", 20).get("/api/products").then().statusCode(200).body("data[0].giaBanSo", equalTo(110000));
        given().queryParam("q", "Cache").get("/api/products/search").then().statusCode(200).body("size()", equalTo(0));
        given().get("/api/products/brands").then().statusCode(200).body("$", contains("Updated brand"));
        given().auth().oauth2(admin).contentType("application/json").body(edit("Updated phone", 110000L, false))
                .put("/api/admin/products/" + productId).then().statusCode(200);
        given().get(path()).then().statusCode(404);
        given().get("/api/products/" + hiddenId).then().statusCode(404);
        given().get("/api/products").then().statusCode(200).body("total", equalTo(0));
        given().auth().oauth2(admin).get("/api/admin/products").then().statusCode(200).body("total", equalTo(2));
        given().get("/api/admin/products").then().statusCode(401);
    }

    @Test void creationIndividualDeleteBulkDeleteAndImportClearInvalidateTheCatalog() {
        warmCatalog();
        long created = given().auth().oauth2(admin).contentType("application/json")
                .body(edit("New cached phone", 120000L, true)).post("/api/admin/products")
                .then().statusCode(201).extract().jsonPath().getLong("product.id");
        given().get("/api/products").then().statusCode(200).body("total", equalTo(2));
        given().get("/api/products/" + created).then().statusCode(200);
        given().auth().oauth2(admin).delete("/api/admin/products/" + created).then().statusCode(200);
        given().get("/api/products/" + created).then().statusCode(404);
        given().auth().oauth2(admin).contentType("application/json").body(List.of(productId, hiddenId))
                .post("/api/admin/products/bulk-delete").then().statusCode(200);
        given().get(path()).then().statusCode(404);
        given().get("/api/products").then().statusCode(200).body("total", equalTo(0));
        given().auth().oauth2(admin).contentType("application/json").body(edit("Import clear test", 120000L, true))
                .post("/api/admin/products").then().statusCode(201);
        given().get("/api/products").then().statusCode(200).body("total", equalTo(1));
        given().auth().oauth2(admin).delete("/api/import/products").then().statusCode(200);
        given().get("/api/products").then().statusCode(200).body("total", equalTo(0));
    }

    @Test void rollbackDoesNotInvalidateOrPublishUncommittedProductChanges() {
        warmCatalog();
        String before = generation();
        assertThrows(IllegalStateException.class, () -> QuarkusTransaction.requiringNew().run(() -> {
            Product update = new Product(); update.tenSanPham = "Rolled back"; update.giaBanSo = 999L;
            products.updateProduct(productId, update);
            throw new IllegalStateException("Intentional rollback");
        }));
        assertEquals(before, generation());
        given().get(path()).then().statusCode(200).body("tenSanPham", equalTo("Cache phone"));
    }

    @Test void stockChangesFromOrderAndCancellationInvalidateCachedProducts() {
        warmCatalog();
        given().auth().oauth2(customer).contentType("application/json").body(Map.of("productId", productId, "quantity", 1))
                .post("/api/cart").then().statusCode(200);
        long orderId = given().auth().oauth2(customer).contentType("application/json")
                .body(Map.of("customerName", "Cache test", "customerPhone", "0900000000",
                        "shippingAddress", "Test address", "paymentMethod", "COD"))
                .post("/api/orders").then().statusCode(201).extract().jsonPath().getLong("order.id");
        given().get(path()).then().statusCode(200).body("stockQuantity", equalTo(4));
        given().queryParam("size", 20).get("/api/products").then().statusCode(200).body("data[0].stockQuantity", equalTo(4));
        given().auth().oauth2(customer).put("/api/orders/" + orderId + "/cancel").then().statusCode(200);
        given().get(path()).then().statusCode(200).body("stockQuantity", equalTo(5));
    }

    @Test void realRedisEntriesHaveATtlAndExpiredEntriesReload() throws InterruptedException {
        given().get(path()).then().statusCode(200);
        List<String> keys = redis.key().keys(namespace + ":*:detail:*");
        String current = generation();
        String key = keys.stream().filter(k -> k.contains(current)).findFirst()
                .orElseThrow(() -> new AssertionError("No detail entry for generation " + current + "; keys=" + keys));
        long ttl = redis.key().ttl(key);
        assertTrue(ttl > 0 && ttl <= 60);
        QuarkusTransaction.requiringNew().run(() -> Product.<Product>findById(productId).tenSanPham = "After expiry");
        redis.key().expire(key, 1);
        Thread.sleep(1100);
        given().get(path()).then().statusCode(200).body("tenSanPham", equalTo("After expiry"));
    }

    @Test void aRealRedisTimeoutDoesNotBreakReadsOrWritesAndRecoveryFlushesPendingChanges() throws InterruptedException {
        warmCatalog();
        // This test connects only to the dedicated Redis test instance, never the app cache.
        redis.execute("CLIENT", "PAUSE", "1200", "ALL");
        try {
            given().get(path()).then().statusCode(200).body("tenSanPham", equalTo("Cache phone"));
            given().auth().oauth2(admin).contentType("application/json").body(edit("Updated during outage", 110000L, true))
                    .put("/api/admin/products/" + productId).then().statusCode(200);
        } finally {
            Thread.sleep(1400); // Do not leak a paused Redis into the next test if an assertion fails.
        }
        given().get(path()).then().statusCode(200).body("tenSanPham", equalTo("Updated during outage"));
        given().queryParam("size", 20).get("/api/products").then().statusCode(200)
                .body("data[0].tenSanPham", equalTo("Updated during outage"));
    }
}
