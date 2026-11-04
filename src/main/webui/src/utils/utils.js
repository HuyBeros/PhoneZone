export const fmt = (n) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
};

export const discount = (p, o) => {
  if (!o || o <= p) return null;
  return `-${Math.round((o - p) / o * 100)}%`;
};

// Trích xuất 2 thông số ngắn gọn, chuẩn tỉ lệ cho Product Card
export const getQuickSpecs = (specs, name = '') => {
  const result = [];
  const s = specs && typeof specs === 'object' ? specs : {};

  // 1. RAM / ROM - rút gọn ngắn gọn
  const ram = s['RAM'] || s['ram'];
  const rom = s['Bộ nhớ trong (ROM)'] || s['Bộ nhớ trong'] || s['ROM'] || s['rom'] || s['Bộ nhớ'];
  if (ram && rom) {
    const cleanRam = String(ram).split(/[,/]/)[0].trim().replace(/\s*GB/i, 'GB');
    const cleanRom = String(rom).split(/[,/]/)[0].trim().replace(/\s*GB/i, 'GB');
    const combined = `${cleanRam}/${cleanRom}`;
    if (combined.length <= 14) {
      result.push(combined);
    } else {
      result.push(cleanRom.slice(0, 10));
    }
  } else if (rom) {
    const cleanRom = String(rom).split(/[,/]/)[0].trim().slice(0, 10);
    result.push(cleanRom);
  } else if (ram) {
    const cleanRam = String(ram).split(/[,/]/)[0].trim().slice(0, 8);
    result.push(`RAM ${cleanRam}`);
  }

  // 2. Chipset - rút gọn tên ngắn
  const chip = s['Chipset'] || s['Chip'] || s['CPU'] || s['Vi xử lý'];
  if (chip && result.length < 2) {
    const cleanChip = String(chip).split(/[,/]/)[0].replace(/(Qualcomm|Apple|MediaTek|Snapdragon)\s*/i, '').trim();
    if (cleanChip && cleanChip.length <= 14) {
      result.push(cleanChip);
    }
  }

  // 3. Màn hình: chỉ lấy kích cỡ dạng 6.1" hoặc 6.7"
  const screen = s['Màn hình rộng'] || s['Màn hình'];
  if (screen && result.length < 2) {
    const match = String(screen).match(/(\d+(\.\d+)?)\s*(inch|inches|"|''|\b)/i);
    if (match && match[1]) {
      result.push(`${match[1]}"`);
    }
  }

  // 4. Dung lượng Pin: CHỈ lấy số mAh
  const pin = s['Dung lượng pin'] || s['Pin'];
  if (pin && result.length < 2) {
    const match = String(pin).match(/\b(\d{3,5})\s*mAh\b/i);
    if (match) {
      result.push(`${match[1]} mAh`);
    }
  }

  // Fallback từ tên máy nếu không có specs
  if (result.length === 0 && name) {
    const storageMatch = name.match(/\b(64GB|128GB|256GB|512GB|1TB)\b/i);
    if (storageMatch) result.push(storageMatch[1].toUpperCase());
    if (/\b5G\b/i.test(name)) result.push('5G');
  }

  return result.slice(0, 2);
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

  const idNum = Number(backendP.id) || 1;
  const hasRealReviews = backendP.reviews != null && backendP.reviews > 0;
  const ratingVal = hasRealReviews
    ? Number(backendP.rating)
    : Number((4.6 + ((idNum * 3) % 5) * 0.1).toFixed(1));
  const reviewsVal = hasRealReviews
    ? Number(backendP.reviews)
    : (idNum % 7 === 0 ? 0 : ((idNum * 13) % 45 + 8));

  return {
    id: backendP.id,
    name: backendP.tenSanPham,
    price: backendP.giaBanSo || 0,
    oldPrice: backendP.giaGocSo > 0 ? backendP.giaGocSo : null,
    img: backendP.hinhAnh,
    brand: backendP.danhMuc,
    specs: specsObj,
    rating: ratingVal,
    reviews: reviewsVal,
    isNew: idNum % 6 === 0,
    badge: (backendP.giaGocSo && backendP.giaGocSo > backendP.giaBanSo) ? 'sale' : (idNum % 5 === 0 ? 'hot' : ''),

    // Thêm toàn bộ các trường khác từ Database
    stockQuantity: backendP.stockQuantity,
    isActive: backendP.isActive,
    createdAt: backendP.createdAt,
    thoiGianCao: backendP.thoiGianCao,
    link: backendP.link,
    category: backendP.category
  };
};

// Loại bỏ dấu tiếng Việt phục vụ tìm kiếm không phân biệt dấu
export function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Bảng màu chuẩn cho bộ lọc điện thoại
export const COLOR_PALETTE = [
  { id: 'black', label: 'Đen', hex: '#1e293b', regex: /(đen|black|dark|space gray|midnight)/i },
  { id: 'white', label: 'Trắng', hex: '#ffffff', regex: /(trắng|white|silver|bạc|starlight)/i },
  { id: 'gray', label: 'Xám / Titan', hex: '#94a3b8', regex: /(xám|gray|grey|titan|titanium)/i },
  { id: 'blue', label: 'Xanh dương', hex: '#2563eb', regex: /(xanh dương|blue|navy|pacific|sierra)/i },
  { id: 'yellow', label: 'Vàng / Gold', hex: '#eab308', regex: /(vàng|gold|yellow|amber)/i },
  { id: 'purple', label: 'Tím', hex: '#a855f7', regex: /(tím|purple|violet|lavender)/i },
  { id: 'pink', label: 'Hồng', hex: '#ec4899', regex: /(hồng|pink|rose)/i },
  { id: 'green', label: 'Xanh lá', hex: '#16a34a', regex: /(xanh lá|green|mint|emerald)/i },
];

// Trích xuất các màu có trong sản phẩm
export function extractColors(p) {
  if (!p) return ['black'];
  const text = `${p.name || p.tenSanPham || ''} ${p.img || p.hinhAnh || ''} ${JSON.stringify(p.specs || {})}`.toLowerCase();
  const matched = [];
  for (const c of COLOR_PALETTE) {
    if (c.regex.test(text)) matched.push(c.id);
  }
  if (matched.length === 0) matched.push('black');
  return matched;
}

// Trích xuất các mức dung lượng (ROM) từ sản phẩm
export function extractRoms(p) {
  if (!p) return ['128GB'];
  const s = p.specs && typeof p.specs === 'object' ? p.specs : {};
  const romRaw = s['Bộ nhớ trong (ROM)'] || s['Bộ nhớ trong'] || s['ROM'] || s['rom'] || '';
  const text = `${p.name || p.tenSanPham || ''} ${romRaw}`.toUpperCase();

  const result = new Set();
  if (/64\s*-\s*128\s*GB/.test(text)) { result.add('64GB'); result.add('128GB'); }
  if (/64\s*-\s*256\s*GB/.test(text)) { result.add('64GB'); result.add('128GB'); result.add('256GB'); }
  if (/128\s*-\s*256\s*GB/.test(text)) { result.add('128GB'); result.add('256GB'); }
  if (/128\s*-\s*512\s*GB/.test(text)) { result.add('128GB'); result.add('256GB'); result.add('512GB'); }
  if (/256\s*-\s*512\s*GB/.test(text)) { result.add('256GB'); result.add('512GB'); }
  if (/256\s*GB\s*-\s*1\s*TB/.test(text) || /256\s*-\s*1TB/.test(text)) { result.add('256GB'); result.add('512GB'); result.add('1TB'); }
  if (/128\s*GB\s*-\s*1\s*TB/.test(text) || /128\s*-\s*1TB/.test(text)) { result.add('128GB'); result.add('256GB'); result.add('512GB'); result.add('1TB'); }

  if (/\b32\s*GB\b/.test(text)) result.add('32GB');
  if (/\b64\s*GB\b/.test(text)) result.add('64GB');
  if (/\b128\s*GB\b/.test(text)) result.add('128GB');
  if (/\b256\s*GB\b/.test(text)) result.add('256GB');
  if (/\b512\s*GB\b/.test(text)) result.add('512GB');
  if (/\b1\s*TB\b/.test(text)) result.add('1TB');

  if (result.size === 0) result.add('128GB');
  return Array.from(result);
}

// Trích xuất các mức RAM từ sản phẩm
export function extractRams(p) {
  if (!p) return ['8GB'];
  const s = p.specs && typeof p.specs === 'object' ? p.specs : {};
  const ramRaw = s['RAM'] || s['ram'] || '';
  const text = `${p.name || p.tenSanPham || ''} ${ramRaw}`.toUpperCase();

  const result = new Set();
  if (/4\s*-\s*6\s*GB/.test(text)) { result.add('4GB'); result.add('6GB'); }
  if (/4\s*-\s*8\s*GB/.test(text)) { result.add('4GB'); result.add('6GB'); result.add('8GB'); }
  if (/6\s*-\s*8\s*GB/.test(text)) { result.add('6GB'); result.add('8GB'); }
  if (/6\s*-\s*12\s*GB/.test(text)) { result.add('6GB'); result.add('8GB'); result.add('12GB'); }
  if (/8\s*-\s*12\s*GB/.test(text)) { result.add('8GB'); result.add('12GB'); }
  if (/12\s*-\s*16\s*GB/.test(text)) { result.add('12GB'); result.add('16GB'); }
  if (/12\s*-\s*24\s*GB/.test(text)) { result.add('12GB'); result.add('16GB'); result.add('24GB'); }

  if (/\b3\s*GB\b/.test(text)) result.add('3GB');
  if (/\b4\s*GB\b/.test(text)) result.add('4GB');
  if (/\b6\s*GB\b/.test(text)) result.add('6GB');
  if (/\b8\s*GB\b/.test(text)) result.add('8GB');
  if (/\b12\s*GB\b/.test(text)) result.add('12GB');
  if (/\b16\s*GB\b/.test(text)) result.add('16GB');
  if (/\b24\s*GB\b/.test(text)) result.add('24GB');

  if (result.size === 0) result.add('8GB');
  return Array.from(result);
}
