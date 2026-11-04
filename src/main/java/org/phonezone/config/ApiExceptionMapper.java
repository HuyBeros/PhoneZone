package org.phonezone.config;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.Map;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<IllegalArgumentException> {
    @Override
    public Response toResponse(IllegalArgumentException exception) {
        return Response.status(400).entity(Map.of("error", exception.getMessage() == null
                ? "Thông tin không hợp lệ" : exception.getMessage())).build();
    }
}
