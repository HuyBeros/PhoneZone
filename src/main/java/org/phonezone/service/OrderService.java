package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.phonezone.dto.OrderRequest;
import org.phonezone.entity.*;

import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class OrderService {

    @Inject
    CartService cartService;

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
        User user = User.find("username", username).firstResult();
        if (user == null) return null;

        List<CartItem> cartItems = cartService.getCartItems(username);
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
            Product product = cartItem.product;
            if (product.stockQuantity < cartItem.quantity) {
                throw new IllegalArgumentException("Sản phẩm " + product.tenSanPham + " không đủ số lượng");
            }

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
        if (request.couponCode != null && !request.couponCode.isBlank()) {
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

        order.discountAmount = discount;
        order.finalAmount = Math.max(0, totalAmount - discount);
        
        // Tính điểm thưởng (ví dụ: 10,000 VND = 1 điểm)
        order.earnedPoints = (int) (order.finalAmount / 10000);

        order.orderItems = orderItems;
        order.persist();

        // Cộng điểm cho user
        user.rewardPoints += order.earnedPoints;
        user.persist();

        // Xóa giỏ hàng
        cartService.clearCart(username);

        return order;
    }

    // --- ADMIN METHODS ---

    public List<Order> getAllOrders() {
        return Order.find("order by createdAt desc").list();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = Order.findById(orderId);
        if (order == null) return null;
        
        order.status = newStatus;
        order.persist();
        return order;
    }

    @Transactional
    public Order cancelOrder(String username, Long orderId) {
        User user = User.find("username", username).firstResult();
        if (user == null) return null;

        Order order = Order.find("id = ?1 and user = ?2", orderId, user).firstResult();
        if (order == null) return null;

        // Chỉ cho phép hủy khi đơn đang ở trạng thái "Đang xử lý"
        if (!"Đang xử lý".equals(order.status)) {
            throw new IllegalStateException("Không thể hủy đơn hàng ở trạng thái: " + order.status);
        }

        // Hoàn lại số lượng tồn kho
        if (order.orderItems != null) {
            for (OrderItem item : order.orderItems) {
                Product product = item.product;
                if (product != null) {
                    product.stockQuantity += item.quantity;
                    product.persist();
                }
            }
        }

        order.status = "Đã hủy";
        order.updatedAt = java.time.LocalDateTime.now();
        order.persist();
        return order;
    }
}
