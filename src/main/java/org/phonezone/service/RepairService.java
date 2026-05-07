package org.phonezone.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.phonezone.dto.RepairRequest;
import org.phonezone.entity.Repair;
import org.phonezone.entity.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class RepairService {

    // Bảng giá dịch vụ sửa chữa
    private static final Map<String, Long> SERVICE_PRICES = new HashMap<>();
    
    static {
        SERVICE_PRICES.put("Thay màn hình", 1500000L);
        SERVICE_PRICES.put("Thay pin", 800000L);
        SERVICE_PRICES.put("Sửa camera", 1200000L);
        SERVICE_PRICES.put("Thay kính lưng", 600000L);
        SERVICE_PRICES.put("Sửa loa", 500000L);
        SERVICE_PRICES.put("Sửa mic", 400000L);
        SERVICE_PRICES.put("Thay jack tai nghe", 300000L);
        SERVICE_PRICES.put("Sửa nguồn", 700000L);
        SERVICE_PRICES.put("Thay camera sau", 1000000L);
        SERVICE_PRICES.put("Thay camera trước", 800000L);
        SERVICE_PRICES.put("Sửa Face ID", 1500000L);
        SERVICE_PRICES.put("Sửa vân tay", 600000L);
        SERVICE_PRICES.put("Thay khung viền", 900000L);
        SERVICE_PRICES.put("Vệ sinh máy", 200000L);
        SERVICE_PRICES.put("Cài đặt phần mềm", 150000L);
        SERVICE_PRICES.put("Khác", 0L);
    }

    @Transactional
    public void init(@jakarta.enterprise.event.Observes io.quarkus.runtime.StartupEvent ev) {
        if (org.phonezone.entity.RepairServiceEntity.count() == 0) {
            for (Map.Entry<String, Long> entry : SERVICE_PRICES.entrySet()) {
                org.phonezone.entity.RepairServiceEntity entity = new org.phonezone.entity.RepairServiceEntity();
                entity.tenDichVu = entry.getKey();
                entity.giaSo = entry.getValue();
                entity.giaHienThi = entry.getValue() == 0 ? "Liên hệ" : String.format("%,d ₫", entry.getValue());
                entity.link = "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&q=80&w=400";
                entity.persist();
            }
        }
    }

    @Transactional
    public Repair createRepair(RepairRequest request, User user) {
        Repair repair = new Repair();
        repair.user = user;
        repair.customerName = request.customerName;
        repair.customerPhone = request.customerPhone;
        repair.customerEmail = request.customerEmail;
        repair.deviceType = request.deviceType;
        repair.deviceModel = request.deviceModel;
        repair.issueDescription = request.issueDescription;
        repair.repairService = request.repairService;
        repair.priority = request.priority != null ? request.priority : "NORMAL";
        repair.appointmentDate = request.appointmentDate;
        
        // Tự động tính giá dự kiến
        repair.estimatedCost = SERVICE_PRICES.getOrDefault(request.repairService, 0L);
        
        repair.status = "PENDING";
        repair.persist();
        return repair;
    }

    public List<Repair> getUserRepairs(User user) {
        return Repair.find("user = ?1 ORDER BY createdAt DESC", user).list();
    }

    public List<Repair> getAllRepairs(int page, int size) {
        return Repair.find("ORDER BY createdAt DESC")
                .page(page, size)
                .list();
    }

    public Repair getRepairById(Long id) {
        return Repair.findById(id);
    }

    @Transactional
    public Repair updateRepairStatus(Long id, String status, String technicianNotes) {
        Repair repair = Repair.findById(id);
        if (repair != null) {
            repair.status = status;
            if (technicianNotes != null) {
                repair.technicianNotes = technicianNotes;
            }
            if ("COMPLETED".equals(status)) {
                repair.completionDate = java.time.LocalDateTime.now();
            }
        }
        return repair;
    }

    @Transactional
    public void cancelRepair(Long id) {
        Repair repair = Repair.findById(id);
        if (repair != null) {
            repair.status = "CANCELLED";
        }
    }

    public Map<String, Long> getServicePrices() {
        return SERVICE_PRICES;
    }

    public long countRepairs() {
        return Repair.count();
    }

    public long countRepairsByStatus(String status) {
        return Repair.count("status = ?1", status);
    }
}
