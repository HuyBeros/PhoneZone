package org.phonezone.config;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Random;

@ApplicationScoped
public class VNPayConfig {

    @ConfigProperty(name = "vnpay.payUrl", defaultValue = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
    String vnpPayUrl;

    @ConfigProperty(name = "vnpay.returnUrl", defaultValue = "https://phonezone-app.onrender.com/api/payment/vnpay-return")
    String vnpReturnUrl;

    @ConfigProperty(name = "vnpay.tmnCode", defaultValue = "N3GP3Q81")
    String vnpTmnCode;

    @ConfigProperty(name = "vnpay.secretKey", defaultValue = "A5ZK2ULBKQOEXM59KOR4WHSP6F03NLIR")
    String secretKey;

    @ConfigProperty(name = "vnpay.apiUrl", defaultValue = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction")
    String vnpApiUrl;

    public String getVnpPayUrl() {
        return vnpPayUrl;
    }

    public String getVnpReturnUrl() {
        return vnpReturnUrl;
    }

    public String getVnpTmnCode() {
        return vnpTmnCode;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getVnpApiUrl() {
        return vnpApiUrl;
    }

    public String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append("=");
                sb.append(fieldValue);
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        return hmacSHA512(getSecretKey(), sb.toString());
    }

    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            return "";
        }
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
