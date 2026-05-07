package org.phonezone.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class ProductImportDto {

    @JsonProperty("ten_san_pham")
    public String tenSanPham;

    @JsonProperty("gia_ban")
    public String giaBan;

    @JsonProperty("gia_ban_so")
    public Long giaBanSo;

    @JsonProperty("gia_goc")
    public String giaGoc;

    @JsonProperty("gia_goc_so")
    public Long giaGocSo;

    @JsonProperty("link")
    public String link;

    @JsonProperty("hinh_anh")
    public String hinhAnh;

    @JsonProperty("danh_muc")
    public String danhMuc;

    @JsonProperty("thoi_gian_cao")
    public String thoiGianCao;

    @JsonProperty("thong_so")
    public Map<String, String> thongSo;
}
