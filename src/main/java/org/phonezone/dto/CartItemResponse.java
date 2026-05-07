package org.phonezone.dto;

import org.phonezone.entity.CartItem;

public class CartItemResponse {
    public Long id;
    public Long productId;
    public String productName;
    public String productImage;
    public Long price;
    public Integer quantity;
    public Long itemTotal;

    public static CartItemResponse from(CartItem item) {
        CartItemResponse dto = new CartItemResponse();
        dto.id = item.id;
        if (item.product != null) {
            dto.productId = item.product.id;
            dto.productName = item.product.tenSanPham;
            dto.productImage = item.product.hinhAnh;
            dto.price = item.product.giaBanSo;
            dto.itemTotal = item.product.giaBanSo * item.quantity;
        }
        dto.quantity = item.quantity;
        return dto;
    }
}
