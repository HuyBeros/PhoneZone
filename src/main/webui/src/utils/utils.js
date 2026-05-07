export const fmt = (n) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

export const discount = (p, o) => {
  if (!o || o <= p) return null;
  return `-${Math.round((o - p) / o * 100)}%`;
};

// Map từ định dạng Backend (Product) sang Frontend (p)
export const mapProduct = (backendP) => {
  if (!backendP) return null;
  let specsObj = {};
  if (backendP.thongSo) {
    try {
      specsObj = typeof backendP.thongSo === 'string' ? JSON.parse(backendP.thongSo) : backendP.thongSo;
    } catch(e) {}
  }
  return {
    id: backendP.id,
    name: backendP.tenSanPham,
    price: backendP.giaBanSo,
    oldPrice: backendP.giaGocSo || 0,
    img: backendP.hinhAnh,
    brand: backendP.danhMuc,
    specs: specsObj,
    rating: 5,
    reviews: 100, // mock reviews for now
    isNew: false,
    badge: '',
    
    // Thêm toàn bộ các trường khác từ Database
    stockQuantity: backendP.stockQuantity,
    isActive: backendP.isActive,
    createdAt: backendP.createdAt,
    thoiGianCao: backendP.thoiGianCao,
    link: backendP.link,
    category: backendP.category
  };
};
