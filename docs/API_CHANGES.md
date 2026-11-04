# Hợp đồng thay đổi API — đợt cải tiến sau xác thực

Giữ định dạng response hiện có để các màn hình đang dùng tiếp tục hoạt động.

- `/api/admin/coupons`, `/api/admin/contacts`, `/api/import/*`: chưa đăng nhập trả 401; ROLE_USER trả 403; ROLE_ADMIN được phép theo từng phương thức.
- `GET /api/repairs/{id}`: cần đăng nhập; chỉ chủ phiếu hoặc admin được xem, người khác nhận 404 để tránh dò ID. Danh mục dịch vụ và gửi yêu cầu cho khách vãng lai vẫn mở; không cung cấp tra cứu công khai bằng ID tuần tự.
- Mật khẩu mới dùng bcrypt; hash SHA-256 đang có được nâng cấp sau đăng nhập hợp lệ. Đổi mật khẩu chỉ qua `/api/users/me/password` có xác thực mật khẩu cũ. Admin tạo tài khoản phải nhập mật khẩu, không còn mật khẩu mặc định.
- `GET /api/products`: thêm `q`; tìm kiếm/filter/sort/page áp dụng trên toàn bộ sản phẩm đang bật. `page >= 0`, `1 <= size <= 200`, khoảng giá hợp lệ. Response giữ `{data,total,page,size,totalPages}`. Sản phẩm đã tắt không hiện ở danh sách/search/chi tiết công khai.
- `GET /api/admin/products`: endpoint riêng cho cả sản phẩm đã tắt, cùng response phân trang. Các màn hình admin dùng endpoint này.
- `POST /api/orders/quote`: nhận `{couponCode?,paymentMethod?}`, trả `{totalAmount,shippingFee,discountAmount,finalAmount}` theo giỏ hàng và coupon thực tế; không ghi đơn. Giỏ trống, coupon không thuộc người dùng/đã dùng, hết hàng hoặc phương thức không hợp lệ trả 400.
- Đơn COD/BANK mới: phí ship 50.000đ khi tổng sản phẩm không vượt 10 triệu; đơn trên 10 triệu hoặc coupon miễn ship không thu phí. Giảm giá không vượt tiền sản phẩm. Backend tính lại khi đặt, không tin giá client. Điểm chỉ cộng khi admin chuyển đơn sang Hoàn thành, mỗi đơn một lần; hủy đơn hoàn tồn kho và coupon gắn với đơn đúng một lần. Đơn hoàn thành/đã hủy không được đổi sang trạng thái khác.
- Luồng VNPay được giữ nguyên theo yêu cầu: không thay URL/callback/chữ ký/cách ghi nhận thanh toán; các thay đổi tính tiền và thời điểm cộng điểm ở trên áp dụng COD/BANK. Chưa kiểm thử thanh toán VNPay.

Database test: `phonezone_test`, độc lập với `phonezone_db`. Production mới dùng Flyway V1 và Hibernate validate; database cũ cần đối chiếu/adopt baseline theo [hướng dẫn triển khai](deployment.md). Development vẫn dùng schema update.

## Chuẩn bị triển khai

- `GET /api/health`: 200 khi database kết nối được, 503 khi không kết nối được.
- Production không tạo tài khoản demo; bootstrap admin lần đầu được bật rõ ràng bằng biến môi trường.
- Secret VNPay đọc từ môi trường. Khi thiếu merchant/key, `POST /api/orders` với VNPAY trả 503 trước khi tạo đơn, callback cũng trả 503. Không thay thuật toán thanh toán/chữ ký/cách ghi nhận của luồng đã cấu hình.
