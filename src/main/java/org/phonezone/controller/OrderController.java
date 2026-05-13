package org.phonezone.controller;

import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.phonezone.dto.OrderRequest;
import org.phonezone.dto.OrderResponse;
import org.phonezone.entity.Order;
import org.phonezone.service.OrderService;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import org.phonezone.config.VNPayConfig;
import jakarta.ws.rs.core.Context;
import io.vertx.core.http.HttpServerRequest;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class OrderController {

    @Inject
    JsonWebToken jwt;

    @Inject
    OrderService orderService;

    @Inject
    VNPayConfig vnPayConfig;

    @Inject
    HttpServerRequest requestContext;

    @GET
    @jakarta.transaction.Transactional
    public Response getMyOrders() {
        String username = jwt.getName();
        List<Order> orders = orderService.getUserOrders(username);
        
        List<OrderResponse> responseList = orders.stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());

        return Response.ok(responseList).build();
    }

    @GET
    @Path("/{id}")
    @jakarta.transaction.Transactional
    public Response getOrderDetails(@PathParam("id") Long orderId) {
        String username = jwt.getName();
        Order order = orderService.getOrderDetails(username, orderId);
        
        if (order == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Không tìm thấy đơn hàng"))
                    .build();
        }

        return Response.ok(OrderResponse.from(order)).build();
    }

    @POST
    public Response createOrder(@Valid OrderRequest request) {
        try {
            String username = jwt.getName();
            Order order = orderService.createOrder(username, request);
            
            if (order == null) {
                return Response.status(Response.Status.UNAUTHORIZED).build();
            }

            if ("VNPAY".equalsIgnoreCase(request.paymentMethod)) {
                // Generate VNPAY payment URL
                String vnp_Version = "2.1.0";
                String vnp_Command = "pay";
                String orderType = "other";
                long amount = order.finalAmount * 100;

                String vnp_TxnRef = String.valueOf(order.id);
                
                String vnp_IpAddr = requestContext.getHeader("X-FORWARDED-FOR");
                if (vnp_IpAddr == null || vnp_IpAddr.isEmpty()) {
                    try {
                        vnp_IpAddr = requestContext.remoteAddress() != null ? requestContext.remoteAddress().host() : "127.0.0.1";
                    } catch (Exception e) {
                        vnp_IpAddr = "127.0.0.1";
                    }
                }
                // VNPay requires IPv4 format, avoid IPv6 localhost
                if (vnp_IpAddr != null && vnp_IpAddr.contains(":")) {
                    vnp_IpAddr = "127.0.0.1";
                }

                String vnp_TmnCode = vnPayConfig.getVnpTmnCode();

                Map<String, String> vnp_Params = new HashMap<>();
                vnp_Params.put("vnp_Version", vnp_Version);
                vnp_Params.put("vnp_Command", vnp_Command);
                vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
                vnp_Params.put("vnp_Amount", String.valueOf(amount));
                vnp_Params.put("vnp_CurrCode", "VND");
                vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
                vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
                vnp_Params.put("vnp_OrderType", orderType);
                vnp_Params.put("vnp_Locale", "vn");
                vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
                vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

                Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
                String vnp_CreateDate = formatter.format(cld.getTime());
                vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

                cld.add(Calendar.MINUTE, 15);
                String vnp_ExpireDate = formatter.format(cld.getTime());
                vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

                List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
                Collections.sort(fieldNames);
                StringBuilder hashData = new StringBuilder();
                StringBuilder query = new StringBuilder();
                Iterator<String> itr = fieldNames.iterator();
                while (itr.hasNext()) {
                    String fieldName = itr.next();
                    String fieldValue = vnp_Params.get(fieldName);
                    if ((fieldValue != null) && (fieldValue.length() > 0)) {
                        //Build hash data
                        hashData.append(fieldName);
                        hashData.append('=');
                        hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                        //Build query
                        query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                        query.append('=');
                        query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                        if (itr.hasNext()) {
                            query.append('&');
                            hashData.append('&');
                        }
                    }
                }
                String queryUrl = query.toString();
                String vnp_SecureHash = vnPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
                queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
                String paymentUrl = vnPayConfig.getVnpPayUrl() + "?" + queryUrl;

                return Response.status(Response.Status.CREATED)
                        .entity(Map.of(
                                "message", "Tạo đơn hàng thành công, chuyển hướng đến VNPAY",
                                "paymentUrl", paymentUrl,
                                "order", OrderResponse.from(order)
                        ))
                        .build();
            }

            return Response.status(Response.Status.CREATED)
                    .entity(Map.of(
                            "message", "Đặt hàng thành công",
                            "order", OrderResponse.from(order)
                    ))
                    .build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (jakarta.validation.ConstraintViolationException e) {
            String msg = e.getConstraintViolations().stream()
                    .map(cv -> cv.getMessage())
                    .collect(Collectors.joining("; "));
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", msg))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Lỗi hệ thống: " + (e.getMessage() != null ? e.getMessage() : e.toString())))
                    .build();
        }
    }

    @PUT
    @Path("/{id}/cancel")
    @jakarta.transaction.Transactional
    public Response cancelOrder(@PathParam("id") Long orderId) {
        try {
            String username = jwt.getName();
            Order order = orderService.cancelOrder(username, orderId);

            if (order == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Không tìm thấy đơn hàng"))
                        .build();
            }

            return Response.ok(Map.of(
                    "message", "Hủy đơn hàng thành công",
                    "order", OrderResponse.from(order)
            )).build();

        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Lỗi hệ thống: " + (e.getMessage() != null ? e.getMessage() : e.toString())))
                    .build();
        }
    }
}
