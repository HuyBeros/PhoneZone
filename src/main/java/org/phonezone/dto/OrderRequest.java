package org.phonezone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrderRequest {

    @NotBlank(message = "Tên khách hàng không được để trống")
    public String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(min = 10, max = 15, message = "Số điện thoại không hợp lệ")
    public String customerPhone;

    public String customerEmail;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    public String shippingAddress;

    public String paymentMethod = "COD";

    // Optional coupon code
    public String couponCode;
}
