package org.phonezone.controller;

import io.quarkus.panache.common.Sort;
import io.quarkus.security.Authenticated;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.entity.ContactMessage;

import java.util.Map;

@Path("/api/admin/contacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class AdminContactController {

    @GET
    public Response getAllContacts() {
        return Response.ok(ContactMessage.listAll(Sort.by("createdAt").descending())).build();
    }

    @PUT
    @Path("/{id}/status")
    @Transactional
    public Response updateStatus(@PathParam("id") Long id, Map<String, String> body) {
        ContactMessage msg = ContactMessage.findById(id);
        if (msg == null) {
            return Response.status(Response.Status.NOT_FOUND).entity(Map.of("error", "Không tìm thấy tin nhắn")).build();
        }
        String status = body.get("status");
        if (status != null) {
            msg.status = status;
            msg.persist();
        }
        return Response.ok(msg).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteContact(@PathParam("id") Long id) {
        boolean deleted = ContactMessage.deleteById(id);
        if (deleted) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).entity(Map.of("error", "Không tìm thấy tin nhắn")).build();
    }
}
