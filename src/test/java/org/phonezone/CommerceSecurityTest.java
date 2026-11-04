package org.phonezone;

import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.jwt.build.Jwt;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.phonezone.entity.*;
import io.quarkus.elytron.security.common.BcryptUtil;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class CommerceSecurityTest {
    private Long userId, productId, hiddenId, repairId, couponId;
    private String customer, other, admin;
    private static final String PASSWORD = "Test-only-password!";

    private String token(User user) {
        return Jwt.issuer("phonezone-issuer").upn(user.username).subject(user.id.toString())
                .groups(Set.of(user.role)).expiresIn(600).sign();
    }

    @BeforeEach
    void fixtures() {
        QuarkusTransaction.requiringNew().run(() -> {
            OrderItem.deleteAll(); Order.deleteAll(); CartItem.deleteAll(); UserCoupon.deleteAll();
            Repair.deleteAll(); User.deleteAll(); Product.deleteAll();
            User user = user("customer", "ROLE_USER");
            userId = user.id; customer = token(user);
            other = token(user("other", "ROLE_USER"));
            admin = token(user("admin", "ROLE_ADMIN"));
            Product product = new Product();
            product.tenSanPham = "Test phone searchable"; product.danhMuc = "Test brand";
            product.giaBanSo = 100000L; product.stockQuantity = 2; product.persist(); productId = product.id;
            Product hidden = new Product(); hidden.tenSanPham = "Hidden phone"; hidden.isActive = false;
            hidden.giaBanSo = 50000L; hidden.persist(); hiddenId = hidden.id;
            Coupon coupon = new Coupon(); coupon.code = "TEST_" + UUID.randomUUID().toString().substring(0, 8);
            coupon.discountAmount = 20000L; coupon.pointsRequired = 100; coupon.description = "Test coupon";
            coupon.persist(); couponId = coupon.id;
            UserCoupon wallet = new UserCoupon(); wallet.user = user; wallet.coupon = coupon; wallet.persist();
            Repair repair = new Repair(); repair.user = user; repair.customerName = "Test"; repair.customerPhone = "0900000000";
            repair.deviceType = "Phone"; repair.deviceModel = "Test"; repair.issueDescription = "Test issue";
            repair.repairService = "Test service"; repair.persist(); repairId = repair.id;
        });
    }

    private User user(String name, String role) {
        User user = new User(); user.username = name; user.email = name + "@example.invalid";
        user.fullName = "Test " + name; user.passwordHash = BcryptUtil.bcryptHash(PASSWORD);
        user.role = role; user.rewardPoints = 100; user.persist(); return user;
    }

    private String couponCode() {
        return QuarkusTransaction.requiringNew().call(() -> Coupon.<Coupon>findById(couponId).code);
    }

    private Map<String, Object> orderBody(boolean coupon) {
        Map<String, Object> body = new HashMap<>(Map.of("customerName", "Test customer", "customerPhone", "0900000000",
                "shippingAddress", "Test address", "paymentMethod", "COD"));
        if (coupon) body.put("couponCode", couponCode());
        return body;
    }

    private void addCart(String bearer) {
        given().auth().oauth2(bearer).contentType("application/json")
                .body(Map.of("productId", productId, "quantity", 1)).post("/api/cart").then().statusCode(200);
    }

    private long create(boolean coupon) {
        addCart(customer);
        return given().auth().oauth2(customer).contentType("application/json").body(orderBody(coupon))
                .post("/api/orders").then().statusCode(201).extract().jsonPath().getLong("order.id");
    }

    private int status(long id, String status) {
        return given().auth().oauth2(admin).contentType("application/json").body(Map.of("status", status))
                .put("/api/admin/orders/" + id + "/status").statusCode();
    }

    @Test void adminEndpointsRejectCustomers() {
        for (String path : List.of("/api/admin/coupons", "/api/admin/contacts", "/api/admin/products")) {
            given().get(path).then().statusCode(401);
            given().auth().oauth2(customer).get(path).then().statusCode(403);
            given().auth().oauth2(admin).get(path).then().statusCode(200);
        }
        given().auth().oauth2(customer).post("/api/import/products").then().statusCode(403);
        given().auth().oauth2(customer).delete("/api/import/products").then().statusCode(403);
        given().post("/api/import/tablets").then().statusCode(401);
    }

    @Test void unconfiguredVnpayDoesNotCreateAnOrderOrConsumeStock() {
        addCart(customer);
        Map<String, Object> body = orderBody(false);
        body.put("paymentMethod", "VNPAY");
        given().auth().oauth2(customer).contentType("application/json").body(body)
                .post("/api/orders").then().statusCode(503);
        QuarkusTransaction.requiringNew().run(() -> {
            assertEquals(0, Order.count());
            assertEquals(1, CartItem.count());
            assertEquals(2, Product.<Product>findById(productId).stockQuantity);
        });
        given().get("/api/payment/vnpay-return?vnp_SecureHash=").then().statusCode(503);
    }

    @Test void repairDetailsRequireOwnership() {
        given().get("/api/repairs/" + repairId).then().statusCode(401);
        given().auth().oauth2(other).get("/api/repairs/" + repairId).then().statusCode(404);
        given().auth().oauth2(customer).get("/api/repairs/" + repairId).then().statusCode(200);
        given().auth().oauth2(admin).get("/api/repairs/" + repairId).then().statusCode(200);
        given().get("/api/repairs/services").then().statusCode(200);
    }

    @Test void legacyLoginUpgradesHashAndStillAcceptsTheSamePassword() throws Exception {
        String legacy = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(PASSWORD.getBytes(StandardCharsets.UTF_8)));
        QuarkusTransaction.requiringNew().run(() -> User.<User>findById(userId).passwordHash = legacy);
        for (int i = 0; i < 2; i++) {
            given().contentType("application/json").body(Map.of("username", "customer", "password", PASSWORD))
                    .post("/api/auth/login").then().statusCode(200).body("token", not(emptyString()));
        }
        String upgraded = QuarkusTransaction.requiringNew().call(() -> User.<User>findById(userId).passwordHash);
        assertTrue(upgraded.startsWith("$2"));
        assertTrue(BcryptUtil.matches(PASSWORD, upgraded));
        given().contentType("application/json").body(Map.of("username", "customer", "password", "wrong-password"))
                .post("/api/auth/login").then().statusCode(401);
    }

    @Test void profileCannotBypassCurrentPasswordVerification() {
        given().auth().oauth2(customer).contentType("application/json").body(Map.of("newPassword", "replacement-password"))
                .put("/api/users/me").then().statusCode(400);
        given().auth().oauth2(customer).contentType("application/json").body(Map.of("currentPassword", "wrong-password",
                        "newPassword", "replacement-password", "confirmPassword", "replacement-password"))
                .put("/api/users/me/password").then().statusCode(400);
        assertTrue(QuarkusTransaction.requiringNew().call(() -> BcryptUtil.matches(PASSWORD, User.<User>findById(userId).passwordHash)));
    }

    @Test void registrationAndPasswordChangeUseBcrypt() {
        given().contentType("application/json").body(Map.of("username", "new_customer", "email", "new@example.invalid",
                        "fullName", "New test customer", "password", PASSWORD))
                .post("/api/auth/register").then().statusCode(201);
        assertTrue(QuarkusTransaction.requiringNew().call(() ->
                User.<User>find("username", "new_customer").firstResult().passwordHash.startsWith("$2")));
        given().auth().oauth2(customer).contentType("application/json").body(Map.of("currentPassword", PASSWORD,
                        "newPassword", "Updated-test-password!", "confirmPassword", "Updated-test-password!"))
                .put("/api/users/me/password").then().statusCode(200);
        given().contentType("application/json").body(Map.of("username", "customer", "password", "Updated-test-password!"))
                .post("/api/auth/login").then().statusCode(200);
    }

    @Test void invalidFormDataIsRejectedBeforeDatabaseErrors() {
        given().contentType("application/json").body(Map.of("username", "valid_name", "email", "valid@example.invalid",
                        "fullName", "x".repeat(101), "password", PASSWORD))
                .post("/api/auth/register").then().statusCode(400);
        given().contentType("application/json").body(Map.of("name", "", "email", "not-an-email", "message", ""))
                .post("/api/contact").then().statusCode(400);
        given().auth().oauth2(admin).contentType("application/json").body(Map.of("username", "no_password", "role", "ROLE_USER"))
                .post("/api/admin/users").then().statusCode(400);
    }

    @Test void catalogFiltersAcrossTheDatabaseAndHidesDisabledProducts() {
        given().queryParam("q", "searchable").get("/api/products").then().statusCode(200).body("total", is(1));
        given().queryParam("q", "Hidden").get("/api/products").then().statusCode(200).body("total", is(0));
        given().get("/api/products/" + hiddenId).then().statusCode(404);
        given().get("/api/products/search?q=Hidden").then().statusCode(200).body("size()", is(0));
        given().auth().oauth2(admin).get("/api/admin/products").then().statusCode(200).body("total", is(2));
        for (String query : List.of("size=0", "size=201", "page=-1", "minPrice=20&maxPrice=10")) {
            given().get("/api/products?" + query).then().statusCode(400);
        }
    }

    @Test void quoteAndOrderAgreeAndPointsWaitForCompletion() {
        addCart(customer);
        given().auth().oauth2(customer).contentType("application/json").body(Map.of("couponCode", couponCode(), "paymentMethod", "COD"))
                .post("/api/orders/quote").then().statusCode(200).body("totalAmount", is(100000))
                .body("shippingFee", is(50000)).body("discountAmount", is(20000)).body("finalAmount", is(130000));
        given().auth().oauth2(customer).contentType("application/json").body(orderBody(true)).post("/api/orders")
                .then().statusCode(201).body("order.finalAmount", is(130000)).body("order.shippingFee", is(50000))
                .body("order.earnedPoints", is(0));
        assertEquals(100, QuarkusTransaction.requiringNew().call(() -> User.<User>findById(userId).rewardPoints));
    }

    @Test void cancelRestoresStockAndCouponExactlyOnce() {
        long order = create(true);
        for (int i = 0; i < 2; i++) given().auth().oauth2(customer).put("/api/orders/" + order + "/cancel").then().statusCode(200);
        QuarkusTransaction.requiringNew().run(() -> {
            assertEquals(2, Product.<Product>findById(productId).stockQuantity);
            assertEquals("UNUSED", UserCoupon.<UserCoupon>find("user.id", userId).firstResult().status);
            assertEquals(100, User.<User>findById(userId).rewardPoints);
        });
        assertEquals(400, status(order, "Hoàn thành"));
    }

    @Test void completionCreditsOnlyOnceAndTerminalStatesCannotReopen() {
        long order = create(true);
        assertEquals(200, status(order, "Đang giao"));
        assertEquals(200, status(order, "Hoàn thành"));
        assertEquals(200, status(order, "Hoàn thành"));
        assertEquals(108, QuarkusTransaction.requiringNew().call(() -> User.<User>findById(userId).rewardPoints));
        assertEquals(400, status(order, "Đang xử lý"));
        given().auth().oauth2(customer).put("/api/orders/" + order + "/cancel").then().statusCode(400);
    }

    @Test void invalidCouponRollsBackStockAndKeepsCart() {
        addCart(customer);
        Map<String, Object> body = orderBody(false); body.put("couponCode", "DOES_NOT_EXIST");
        given().auth().oauth2(customer).contentType("application/json").body(body).post("/api/orders").then().statusCode(400);
        QuarkusTransaction.requiringNew().run(() -> {
            assertEquals(2, Product.<Product>findById(productId).stockQuantity);
            assertEquals(1, CartItem.count()); assertEquals(0, Order.count());
        });
    }

    @Test void twoCustomersCannotBuyTheLastItem() throws Exception {
        QuarkusTransaction.requiringNew().run(() -> Product.<Product>findById(productId).stockQuantity = 1);
        addCart(customer); addCart(other);
        Map<String, Object> body = orderBody(false);
        List<Integer> statuses = simultaneous(
                () -> given().auth().oauth2(customer).contentType("application/json").body(body).post("/api/orders").statusCode(),
                () -> given().auth().oauth2(other).contentType("application/json").body(body).post("/api/orders").statusCode());
        assertEquals(List.of(201, 400), statuses);
        assertEquals(0, QuarkusTransaction.requiringNew().call(() -> Product.<Product>findById(productId).stockQuantity));
        assertEquals(1L, QuarkusTransaction.requiringNew().<Long>call(() -> Order.count()).longValue());
    }

    @Test void concurrentRedemptionsCannotSpendTheSamePointsTwice() throws Exception {
        QuarkusTransaction.requiringNew().run(() -> UserCoupon.deleteAll());
        Callable<Integer> redeem = () -> given().auth().oauth2(customer).contentType("application/json").post("/api/rewards/redeem/" + couponId).statusCode();
        assertEquals(List.of(200, 400), simultaneous(redeem, redeem));
        assertEquals(0, QuarkusTransaction.requiringNew().call(() -> User.<User>findById(userId).rewardPoints));
        assertEquals(1L, QuarkusTransaction.requiringNew().<Long>call(() -> UserCoupon.count()).longValue());
    }

    @Test void shippingThresholdAndFreeShippingCouponAreConsistent() {
        addCart(customer);
        for (long price : new long[]{9999999L, 10000000L, 10000001L}) {
            QuarkusTransaction.requiringNew().run(() -> Product.<Product>findById(productId).giaBanSo = price);
            given().auth().oauth2(customer).contentType("application/json").body(Map.of("paymentMethod", "BANK"))
                    .post("/api/orders/quote").then().statusCode(200).body("shippingFee", is(price > 10000000L ? 0 : 50000));
        }
        QuarkusTransaction.requiringNew().run(() -> {
            Product.<Product>findById(productId).giaBanSo = 100000L;
            Coupon.<Coupon>findById(couponId).description = "Test miễn ship";
        });
        given().auth().oauth2(customer).contentType("application/json").body(Map.of("couponCode", couponCode()))
                .post("/api/orders/quote").then().statusCode(200).body("shippingFee", is(0)).body("finalAmount", is(80000));
    }

    @Test void catalogCanSearchPastTheFirstHundredProducts() {
        QuarkusTransaction.requiringNew().run(() -> {
            for (int i = 0; i < 120; i++) {
                Product product = new Product(); product.tenSanPham = "Catalog phone " + i;
                product.giaBanSo = 100000L + i; product.persist();
            }
        });
        given().get("/api/products?page=0&size=15").then().statusCode(200)
                .body("total", is(121)).body("data.size()", is(15));
        given().get("/api/products?page=8&size=15").then().statusCode(200).body("data.size()", is(1));
        given().queryParam("q", "Catalog phone 119").get("/api/products").then().statusCode(200).body("total", is(1));
    }

    @Test void completingTwoOrdersTogetherDoesNotLoseRewardPoints() throws Exception {
        long first = create(false), second = create(false);
        assertEquals(200, status(first, "Đang giao"));
        assertEquals(200, status(second, "Đang giao"));
        assertEquals(List.of(200, 200), simultaneous(() -> status(first, "Hoàn thành"), () -> status(second, "Hoàn thành")));
        assertEquals(120, QuarkusTransaction.requiringNew().call(() -> User.<User>findById(userId).rewardPoints));
    }

    private List<Integer> simultaneous(Callable<Integer> first, Callable<Integer> second) throws Exception {
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            CountDownLatch gate = new CountDownLatch(1);
            Future<Integer> a = executor.submit(() -> { gate.await(); return first.call(); });
            Future<Integer> b = executor.submit(() -> { gate.await(); return second.call(); });
            gate.countDown();
            List<Integer> result = new ArrayList<>(List.of(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS)));
            Collections.sort(result); return result;
        }
    }
}
