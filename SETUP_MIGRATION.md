# 🚀 Hướng dẫn chạy Migration

## ✅ Đã hoàn thành

### Backend:
- ✅ Cập nhật `Category` entity với các trường: slug, logoUrl, color, emoji, displayOrder, isActive
- ✅ Cập nhật `CategoryService` với methods: getAllBrands(), getBrandBySlug()
- ✅ Cập nhật `CategoryController` với endpoints: GET /api/categories/brands, GET /api/categories/brands/{slug}
- ✅ Tạo migration SQL: `V2__add_brand_fields.sql`

### Frontend:
- ✅ Tạo hook `useBrands()` để gọi API
- ✅ Cập nhật `Navbar.jsx` để dùng API
- ✅ Cập nhật `HomePage.jsx` để dùng API
- ✅ Cập nhật `BrandPage.jsx` để dùng API

---

## 📋 Các bước chạy

### 1. Chạy Migration Database

#### Option A: Sử dụng Flyway (Tự động)
Nếu project đã cấu hình Flyway, migration sẽ tự động chạy khi start application:

```bash
# Chỉ cần start lại backend
./mvnw quarkus:dev
```

#### Option B: Chạy SQL thủ công
Nếu chưa có Flyway, chạy SQL script thủ công:

```bash
# Kết nối vào PostgreSQL
psql -U postgres -d phonezone

# Chạy script
\i src/main/resources/db/migration/V2__add_brand_fields.sql
```

Hoặc copy nội dung file `V2__add_brand_fields.sql` và chạy trong pgAdmin hoặc DBeaver.

### 2. Kiểm tra Database

```sql
-- Kiểm tra cấu trúc bảng
\d categories

-- Kiểm tra dữ liệu brands
SELECT id, name, slug, logo_url, color, emoji, display_order, is_active 
FROM categories 
ORDER BY display_order;
```

Kết quả mong đợi: 11 brands (iPhone, Samsung, Xiaomi, Redmi, OPPO, Realme, Vivo, OnePlus, Honor, Nubia, Meizu)

### 3. Start Backend

```bash
cd /path/to/project
./mvnw quarkus:dev
```

### 4. Test API Endpoints

```bash
# Test lấy danh sách brands
curl http://localhost:8080/api/categories/brands

# Test lấy brand theo slug
curl http://localhost:8080/api/categories/brands/iphone

# Test lấy products theo brand
curl http://localhost:8080/api/products?brand=iphone&size=10
```

### 5. Start Frontend

```bash
cd src/main/webui
npm install  # Nếu chưa install
npm run dev
```

### 6. Kiểm tra Frontend

Mở browser: `http://localhost:5173`

**Kiểm tra các điểm sau:**
- ✅ Navbar dropdown hiển thị logo brands
- ✅ HomePage brand tabs hiển thị logo brands
- ✅ BrandPage brand switcher hiển thị logo brands
- ✅ Click vào brand → Lọc sản phẩm đúng
- ✅ Loading state hiển thị khi đang fetch API

---

## 🔍 Troubleshooting

### Lỗi: "Column already exists"
```sql
-- Xóa các cột nếu đã tồn tại
ALTER TABLE categories DROP COLUMN IF EXISTS slug;
ALTER TABLE categories DROP COLUMN IF EXISTS logo_url;
-- ... (xóa các cột khác)

-- Sau đó chạy lại migration
```

### Lỗi: "Cannot find module 'useBrands'"
```bash
# Đảm bảo file hook đã được tạo
ls src/main/webui/src/hooks/useBrands.js

# Nếu chưa có, tạo lại file
```

### Lỗi: API trả về 404
```bash
# Kiểm tra backend đang chạy
curl http://localhost:8080/api/categories/brands

# Kiểm tra database có dữ liệu
psql -U postgres -d phonezone -c "SELECT COUNT(*) FROM categories WHERE is_active = true;"
```

### Frontend không hiển thị brands
1. Mở DevTools Console (F12)
2. Kiểm tra có lỗi API không
3. Kiểm tra Network tab → XHR → Xem request `/api/categories/brands`
4. Nếu API trả về 200 nhưng không hiển thị → Kiểm tra React DevTools

---

## 📊 So sánh trước và sau

### TRƯỚC (Hardcode):
```javascript
// data.js
export const BRANDS = [
  { id: "iphone", name: "iPhone", ... }
];

// Component
import { BRANDS } from '../data/data';
const brands = BRANDS; // Static data
```

### SAU (API):
```javascript
// Hook
const { brands, loading } = useBrands();

// API call
GET /api/categories/brands
→ Database → Response → React State
```

---

## 🎯 Lợi ích đạt được

1. ✅ **Dữ liệu động**: Admin thêm brand mới → Hiển thị ngay
2. ✅ **Không cần deploy**: Thay đổi logo, màu sắc → Cập nhật DB
3. ✅ **Dễ bảo trì**: Quản lý tập trung trong database
4. ✅ **Scalable**: Dễ thêm tính năng mới (search, filter, sort)
5. ✅ **Professional**: Đúng chuẩn kiến trúc REST API

---

## 📝 TODO tiếp theo

### Phase 2: Xóa data.js hoàn toàn
- [ ] Xóa export BRANDS từ data.js
- [ ] Xóa export PHONES từ data.js (đã dùng API)
- [ ] Xóa export ACCESSORIES từ data.js (tạo API sau)
- [ ] Kiểm tra toàn bộ app không còn import từ data.js

### Phase 3: Tối ưu
- [ ] Thêm caching cho brands (localStorage)
- [ ] Thêm error boundary
- [ ] Thêm retry logic khi API fail
- [ ] Thêm skeleton loading

### Phase 4: Admin Panel
- [ ] Tạo UI quản lý brands
- [ ] CRUD operations cho brands
- [ ] Upload logo
- [ ] Sắp xếp thứ tự hiển thị

---

## 🎓 Kết luận

Migration đã hoàn thành! Bây giờ:
- ✅ Brands được lấy từ database qua API
- ✅ Frontend tự động cập nhật khi database thay đổi
- ✅ Không cần sửa code khi thêm/sửa/xóa brands
- ✅ Dễ dàng mở rộng và bảo trì

**Chúc mừng! 🎉**
