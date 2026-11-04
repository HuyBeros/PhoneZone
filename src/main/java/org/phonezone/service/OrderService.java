package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.phonezone.dto.OrderRequest;
import org.phonezone.entity.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Comparator;
import java.time.LocalDateTime;
import jakarta.persistence.LockModeType;

@ApplicationScoped
public class OrderService {

    @Inject
    CartService cartService;

    @Inject
    ProductCatalogCache catalogCache;

    private boolean isVnpay(String method) { return "VNPAY".equalsIgnoreCase(method); }

    private User lockUser(String username) {
        return User.find("username", username).withLock(LockModeType.PESSIMISTIC_WRITE).firstResult();
    }

    private UserCoupon availableCoupon(User user, String code) {
        if (code == null || code.isBlank()) return null;
        UserCoupon coupon = UserCoupon.find("user = ?1 and upper(coupon.code) = ?2 and status = 'UNUSED' and coupon.isActive = true order by id", user, code.trim().toUpperCase(java.util.Locale.ROOT)).firstResult();
        if (coupon == null) throw new IllegalArgumentException("Mã giảm giá không hợp lệ hoặc đã được sử dụng");
        return coupon;
    }

    private Map<String, Long> totals(long subtotal, UserCoupon coupon, String method) {
        long discount = coupon == null ? 0L : Math.min(subtotal, Math.max(0L, coupon.coupon.discountAmount));
        boolean freeShipping = coupon != null && coupon.coupon.description != null
                && coupon.coupon.description.toLowerCase(java.util.Locale.ROOT).contains("miễn ship");
        long shipping = isVnpay(method) || subtotal > 10000000L || freeShipping ? 0L : 50000L;
        return Map.of("totalAmount", subtotal, "shippingFee", shipping,
                "discountAmount", discount, "finalAmount", Math.max(0L, subtotal - discount) + shipping);
    }

    public Map<String, Long> quote(String username, String code, String method) {
        User user = User.find("username", username).firstResult();
        if (user == null) throw new IllegalArgumentException("Không tìm thấy tài khoản");
        validateMethod(method);
        List<CartItem> items = cartService.getCartItems(username);
        if (items.isEmpty()) throw new IllegalArgumentException("Giỏ hàng trống");
        long subtotal = 0;
        for (CartItem item : items) {
            validateItem(item.product, item.quantity);
            subtotal = Math.addExact(subtotal, Math.multiplyExact(item.product.giaBanSo, item.quantity.longValue()));
        }
        return totals(subtotal, availableCoupon(user, code), method);
    }

    private void validateMethod(String method) {
        if (method != null && !List.of("COD", "BANK", "VNPAY").contains(method)) throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
    }

    private void validateItem(Product product, Integer quantity) {
        if (product == null || !Boolean.TRUE.equals(product.isActive) || product.giaBanSo == null || product.giaBanSo < 0
                || quantity == null || quantity < 1 || product.stockQuantity == null || product.stockQuantity < quantity) {
            throw new IllegalArgumentException("Sản phẩm không còn bán hoặc không đủ số lượng");
        }
    }

    public List<Order> getUserOrders(String username) {
        User user = User.find("username", username).firstResult();
        if (user == null) return List.of();
        return Order.find("user = ?1 order by createdAt desc", user).list();
    }

    public Order getOrderDetails(String username, Long orderId) {
        User user = User.find("username", username).firstResult();
        if (user == null) return null;
        return Order.find("id = ?1 and user = ?2", orderId, user).firstResult();
    }

    @Transactional
    public Order createOrder(String username, OrderRequest request) {
        User user = lockUser(username);
        if (user == null) return null;
        validateMethod(request.paymentMethod);
        List<CartItem> cartItems = new ArrayList<>(cartService.getCartItems(username));
        cartItems.sort(Comparator.comparing(item -> item.product.id));
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng trống");
        }

        Order order = new Order();
        order.user = user;
        order.customerName = request.customerName;
        order.customerPhone = request.customerPhone;
        order.customerEmail = request.customerEmail;
        order.shippingAddress = request.shippingAddress;
        order.paymentMethod = request.paymentMethod != null ? request.paymentMethod : "COD";
        order.status = "Đang xử lý";
        
        long totalAmount = 0L;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = Product.findById(cartItem.product.id, LockModeType.PESSIMISTIC_WRITE);
            Product.getEntityManager().refresh(product, LockModeType.PESSIMISTIC_WRITE);
            validateItem(product, cartItem.quantity);

            // Deduct stock
            product.stockQuantity -= cartItem.quantity;
            product.persist();

            OrderItem orderItem = new OrderItem();
            orderItem.order = order;
            orderItem.product = product;
            orderItem.quantity = cartItem.quantity;
            orderItem.unitPrice = product.giaBanSo;
            
            totalAmount += product.giaBanSo * cartItem.quantity;
            orderItems.add(orderItem);
        }

        order.totalAmount = totalAmount;

        // Xử lý coupon nếu có
        long discount = 0L;
        UserCoupon applied = null;
        if (!isVnpay(order.paymentMethod)) {
            applied = availableCoupon(user, request.couponCode);
            if (applied != null) {
                applied.status = "USED";
                applied.usedAt = LocalDateTime.now();
                order.usedCoupon = applied;
            }
        }
        // Retain the existing VNPay flow while the sandbox is unavailable.
        if (isVnpay(order.paymentMethod) && request.couponCode != null && !request.couponCode.isBlank()) {
            Coupon coupon = Coupon.find("code = ?1 and isActive = true", request.couponCode).firstResult();
            // Check if user has this coupon
            if (coupon != null) {
                UserCoupon uc = UserCoupon.find("user = ?1 and coupon = ?2 and status = 'UNUSED'", user, coupon).firstResult();
                if (uc != null) {
                    discount = coupon.discountAmount;
                    uc.status = "USED";
                    uc.usedAt = java.time.LocalDateTime.now();
                    uc.persist();
                }
            }
        }

        if (isVnpay(order.paymentMethod)) {
            order.discountAmount = discount;
            order.finalAmount = Math.max(0, totalAmount - discount);
        } else {
            Map<String, Long> prices = totals(totalAmount, applied, order.paymentMethod);
            order.discountAmount = prices.get("discountAmount");
            order.shippingFee = prices.get("shippingFee");
            order.finalAmount = prices.get("finalAmount");
        }
        
        // Tính điểm thưởng (ví dụ: 10,000 VND = 1 điểm)
        order.earnedPoints = isVnpay(order.paymentMethod) ? (int) (order.finalAmount / 10000) : 0;
        order.rewardsCredited = isVnpay(order.paymentMethod);

        order.orderItems = orderItems;
        order.persist();

        // Cộng điểm cho user
        user.rewardPoints += order.earnedPoints;
        user.persist();

        // Xóa giỏ hàng
        cartService.clearCart(username);

        catalogCache.invalidateAfterCommit();

        return order;
    }

    // --- ADMIN METHODS ---

    public List<Order> getAllOrders() {
        return Order.find("order by createdAt desc").list();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order metadata = Order.findById(orderId);
        if (metadata == null) return null;
        if (metadata.user != null) {
            User lockedUser = User.findById(metadata.user.id, LockModeType.PESSIMISTIC_WRITE);
            User.getEntityManager().refresh(lockedUser, LockModeType.PESSIMISTIC_WRITE);
        }
        Order order = Order.findById(orderId, LockModeType.PESSIMISTIC_WRITE);
        if (order == null) return null;
        Order.getEntityManager().refresh(order, LockModeType.PESSIMISTIC_WRITE);
        if (isVnpay(order.paymentMethod)) {
            order.status = newStatus;
            return order;
        }
        if (newStatus == null) throw new IllegalArgumentException("Trạng thái không hợp lệ");
        if (newStatus.equals(order.status)) return order;
        String current = order.status;
        boolean allowed = switch (current) {
            case "Đang xử lý", "PENDING" -> List.of("Đã xác nhận", "Đang giao", "Admin xác nhận & giao", "Đã hủy").contains(newStatus);
            case "Đã xác nhận" -> List.of("Đang giao", "Admin xác nhận & giao", "Đã hủy").contains(newStatus);
            case "Đang giao", "Admin xác nhận & giao" -> List.of("Hoàn thành", "Đã hủy").contains(newStatus);
            default -> false;
        };
        if (!allowed) throw new IllegalArgumentException("Không thể chuyển từ " + current + " sang " + newStatus);
        if ("Đã hủy".equals(newStatus)) restoreOrder(order);
        if ("Hoàn thành".equals(newStatus) && !Boolean.TRUE.equals(order.rewardsCredited)) {
            order.earnedPoints = (int) (Math.max(0L, order.totalAmount - order.discountAmount) / 10000L);
            if (order.user != null) order.user.rewardPoints += order.earnedPoints;
            order.rewardsCredited = true;
        }
        order.status = newStatus;
        order.updatedAt = LocalDateTime.now();
        order.persist();
        return order;
    }

    @Transactional
    public Order cancelOrder(String username, Long orderId) {
        User user = lockUser(username);
        if (user == null) return null;

        Order order = Order.find("id = ?1 and user = ?2", orderId, user).withLock(LockModeType.PESSIMISTIC_WRITE).firstResult();
        if (order == null) return null;

        if ("Đã hủy".equals(order.status)) return order;
        // Chỉ cho phép hủy khi đơn đang ở trạng thái "Đang xử lý"
        if (!"Đang xử lý".equals(order.status)) {
            throw new IllegalStateException("Không thể hủy đơn hàng ở trạng thái: " + order.status);
        }

        restoreOrder(order);
        order.status = "Đã hủy";
        order.updatedAt = LocalDateTime.now();
        return order;
    }

    private void restoreOrder(Order order) {
        catalogCache.invalidateAfterCommit();
        // Products are always locked in ID order, including cancellation.
        if (order.orderItems != null) {
            List<OrderItem> items = new ArrayList<>(order.orderItems);
            items.sort(Comparator.comparing(item -> item.product.id));
            for (OrderItem item : items) {
                Product product = Product.findById(item.product.id, LockModeType.PESSIMISTIC_WRITE);
                if (product != null) {
                    Product.getEntityManager().refresh(product, LockModeType.PESSIMISTIC_WRITE);
                    product.stockQuantity += item.quantity;
                    product.persist();
                }
            }
        }

        if (!isVnpay(order.paymentMethod)) {
            if (order.usedCoupon != null) {
                order.usedCoupon.status = "UNUSED";
                order.usedCoupon.usedAt = null;
            }
            if (Boolean.TRUE.equals(order.rewardsCredited) && order.user != null) {
                order.user.rewardPoints = Math.max(0, order.user.rewardPoints - order.earnedPoints);
                order.rewardsCredited = false;
                order.earnedPoints = 0;
            }
        }
    }
}
