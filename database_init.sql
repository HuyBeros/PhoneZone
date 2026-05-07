-- Script tạo Database và Bảng cho PhoneZone (PostgreSQL)
-- Phiên bản hỗ trợ đầy đủ tính năng E-commerce: Sản phẩm, Người dùng, Giỏ hàng, Đơn hàng, Tích điểm, Coupon

-- ==========================================
-- 1. QUẢN LÝ SẢN PHẨM & DANH MỤC
-- ==========================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    ten_san_pham TEXT NOT NULL,
    gia_ban VARCHAR(50),
    gia_ban_so BIGINT DEFAULT 0,
    gia_goc VARCHAR(50),
    gia_goc_so BIGINT DEFAULT 0,
    link TEXT,
    hinh_anh TEXT,
    danh_muc VARCHAR(255),
    thoi_gian_cao TIMESTAMP,
    thong_so JSONB, -- Lưu trữ thông số kỹ thuật dạng Object (Màn hình, CPU, Pin...)
    stock_quantity INT DEFAULT 100, -- Số lượng tồn kho
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_danh_muc ON products(danh_muc);
CREATE INDEX idx_products_ten_san_pham ON products(ten_san_pham);

-- ==========================================
-- 2. QUẢN LÝ NGƯỜI DÙNG & TÍCH ĐIỂM
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'ROLE_USER', -- ROLE_USER, ROLE_ADMIN
    reward_points INT DEFAULT 0, -- Điểm thưởng tích lũy khi mua hàng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);

-- ==========================================
-- 3. QUẢN LÝ COUPON & ĐỔI ĐIỂM
-- ==========================================

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_amount BIGINT NOT NULL, -- Số tiền giảm giá (VD: 50000, 100000)
    points_required INT NOT NULL, -- Số điểm cần thiết để đổi lấy mã này
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian: Theo dõi xem User nào đang sở hữu Coupon nào (đã đổi bằng điểm)
CREATE TABLE IF NOT EXISTS user_coupons (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    coupon_id INT REFERENCES coupons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'UNUSED', -- UNUSED (Chưa dùng), USED (Đã dùng), EXPIRED (Hết hạn)
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP
);

-- ==========================================
-- 4. QUẢN LÝ ĐƠN HÀNG (HỖ TRỢ CẢ GUEST & USER)
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Có thể NULL nếu là Guest mua hàng
    
    -- Thông tin giao hàng (Lưu trực tiếp để tránh mất dữ liệu nếu User đổi địa chỉ sau này)
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    shipping_address TEXT NOT NULL,
    
    -- Chi tiết thanh toán
    total_amount BIGINT NOT NULL, -- Tổng tiền hàng
    discount_amount BIGINT DEFAULT 0, -- Tiền giảm từ Coupon
    final_amount BIGINT NOT NULL, -- Số tiền khách thực trả
    payment_method VARCHAR(50) DEFAULT 'COD', -- COD, VNPay, Momo...
    
    -- Trạng thái đơn hàng
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    
    -- Điểm thưởng cộng thêm cho đơn hàng này
    earned_points INT DEFAULT 0, 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Chi tiết các sản phẩm trong 1 đơn hàng
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL, -- Giá tại thời điểm mua (Tránh lỗi do sau này shop đổi giá sản phẩm)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. QUẢN LÝ GIỎ HÀNG (Lưu Giỏ Hàng Database)
-- ==========================================
-- (Tùy chọn: Nếu bạn chỉ lưu giỏ hàng ở LocalStorage thì không cần bảng này,
-- nhưng nếu muốn đồng bộ giỏ hàng khi user đăng nhập trên nhiều thiết bị thì cần)

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- ==========================================
-- 6. QUẢN LÝ DỊCH VỤ SỬA CHỮA
-- ==========================================

-- Bảng danh sách các dịch vụ sửa chữa có sẵn
CREATE TABLE IF NOT EXISTS repair_services (
    id SERIAL PRIMARY KEY,
    ten_dich_vu VARCHAR(500) NOT NULL,
    gia_hien_thi VARCHAR(50),
    gia_so BIGINT DEFAULT 0,
    link TEXT,
    thoi_gian_cao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_repair_services_ten ON repair_services(ten_dich_vu);

-- Bảng yêu cầu sửa chữa từ khách hàng
CREATE TABLE IF NOT EXISTS repairs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL, -- Có thể NULL nếu là Guest
    
    -- Thông tin khách hàng
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    
    -- Thông tin thiết bị
    device_type VARCHAR(100) NOT NULL, -- iPhone, Samsung, Xiaomi, etc.
    device_model VARCHAR(200) NOT NULL, -- iPhone 13 Pro, Galaxy S21, etc.
    
    -- Thông tin sửa chữa
    issue_description TEXT NOT NULL,
    repair_service VARCHAR(200) NOT NULL, -- Tên dịch vụ sửa chữa
    estimated_cost BIGINT, -- Chi phí dự kiến
    
    -- Trạng thái và ưu tiên
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    priority VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, URGENT
    
    -- Thời gian
    appointment_date TIMESTAMP, -- Ngày hẹn
    completion_date TIMESTAMP, -- Ngày hoàn thành
    
    -- Ghi chú kỹ thuật viên
    technician_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_repairs_user_id ON repairs(user_id);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_created_at ON repairs(created_at);
