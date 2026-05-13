package org.phonezone.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import org.phonezone.config.VNPayConfig;
import org.phonezone.entity.Order;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Path("/api/payment")
@PermitAll
public class PaymentController {

    @Inject
    VNPayConfig vnPayConfig;

    @GET
    @Path("/vnpay-return")
    @Transactional
    public Response vnpayReturn(@Context UriInfo uriInfo) {
        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, java.util.List<String>> entry : uriInfo.getQueryParameters().entrySet()) {
            String fieldName = URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII);
            String fieldValue = URLEncoder.encode(entry.getValue().get(0), StandardCharsets.US_ASCII);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = uriInfo.getQueryParameters().getFirst("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }
        
        String signValue = vnPayConfig.hashAllFields(fields);
        
        if (signValue.equals(vnp_SecureHash)) {
            String vnp_TxnRef = uriInfo.getQueryParameters().getFirst("vnp_TxnRef");
            String vnp_ResponseCode = uriInfo.getQueryParameters().getFirst("vnp_ResponseCode");
            
            try {
                Long orderId = Long.parseLong(vnp_TxnRef);
                Order order = Order.findById(orderId);
                
                if (order != null) {
                    if ("00".equals(vnp_ResponseCode)) {
                        order.status = "Hoàn thành"; // VNPAY success
                    } else {
                        order.status = "Đã hủy"; // VNPAY failed
                    }
                    order.persist();
                }
                
                // Redirect back to frontend
                return Response.seeOther(URI.create("https://phonezone-app.onrender.com/orders")).build();
            } catch (Exception e) {
                return Response.seeOther(URI.create("https://phonezone-app.onrender.com/orders?error=invalid_order")).build();
            }
        } else {
            return Response.seeOther(URI.create("https://phonezone-app.onrender.com/orders?error=invalid_signature")).build();
        }
    }
}
