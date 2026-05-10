package org.phonezone.controller;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.phonezone.entity.ContactMessage;

import java.util.Map;

@Path("/api/contact")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContactController {

    @POST
    @Transactional
    public Response submitContact(ContactMessage message) {
        if (message.name == null || message.email == null || message.message == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Vui lòng điền đầy đủ thông tin bắt buộc"))
                    .build();
        }
        message.status = "NEW";
        message.persist();
        return Response.ok(Map.of("success", true, "message", "Đã gửi tin nhắn thành công")).build();
    }
}
