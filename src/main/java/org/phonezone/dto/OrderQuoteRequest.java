package org.phonezone.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class OrderQuoteRequest {
    @Size(max = 50) public String couponCode;
    @Pattern(regexp = "COD|BANK|VNPAY") public String paymentMethod = "COD";
}
