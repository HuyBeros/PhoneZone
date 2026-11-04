package org.phonezone.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.Map;

@Path("/api/health")
@PermitAll
@Produces(MediaType.APPLICATION_JSON)
public class HealthController {
    @Inject EntityManager entityManager;

    @GET
    public Response readiness() {
        try {
            entityManager.createNativeQuery("SELECT 1").getSingleResult();
            return Response.ok(Map.of("status", "UP")).build();
        } catch (RuntimeException exception) {
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(Map.of("status", "DOWN")).build();
        }
    }
}
