package org.phonezone.dto;

import org.phonezone.entity.Order;
import org.phonezone.entity.OrderItem;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {
    public Long id;
    public String customerName;
    public String customerPhone;
    public String shippingAddress;
    public Long totalAmount;
    public Long discountAmount;
    public Long finalAmount;
    public String paymentMethod;
    public String status;
    public Integer earnedPoints;
    public LocalDateTime createdAt;
    public List<OrderItemDto> items;

    public static class OrderItemDto {
        public Long productId;
        public String productName;
        public String productImage;
        public Integer quantity;
        public Long unitPrice;

        public static OrderItemDto from(OrderItem item) {
            OrderItemDto dto = new OrderItemDto();
            if (item.product != null) {
                dto.productId = item.product.id;
                dto.productName = item.product.tenSanPham;
                dto.productImage = item.product.hinhAnh;
            }
            dto.quantity = item.quantity;
            dto.unitPrice = item.unitPrice;
            return dto;
        }
    }

    public static OrderResponse from(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.id = order.id;
        dto.customerName = order.customerName;
        dto.customerPhone = order.customerPhone;
        dto.shippingAddress = order.shippingAddress;
        dto.totalAmount = order.totalAmount;
        dto.discountAmount = order.discountAmount;
        dto.finalAmount = order.finalAmount;
        dto.paymentMethod = order.paymentMethod;
        dto.status = order.status;
        dto.earnedPoints = order.earnedPoints;
        dto.createdAt = order.createdAt;

        if (order.orderItems != null) {
            dto.items = order.orderItems.stream()
                    .map(OrderItemDto::from)
                    .collect(Collectors.toList());
        }

        return dto;
    }
}
