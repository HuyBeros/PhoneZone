# Kiểm tra trước khi push — 04/11/2026

## Đã xử lý

- Bỏ file frontend vanilla cũ, widget không được import, Quarkus greeting/entity mẫu và Dockerfile mẫu không dùng. Giữ Dockerfile triển khai tại gốc, Maven wrapper, npm lockfile và test cần thiết.
- `.gitignore`/`.dockerignore` loại dependency, build output, cấu hình IDE/agent, `.env` thật, private key và backup. JWT fixture công khai trong test được giữ có chủ đích. `.gitattributes` thống nhất line ending; `git diff --check` không còn lỗi whitespace.
- Hai SQL demo phụ thuộc ID người dùng cố định và hai báo cáo cũ được chuyển vào `.local/prepush-archive/` trên máy hiện tại, không đưa lên Git. Không xóa dữ liệu database đang dùng.
- Bỏ merchant/key VNPay khỏi cấu hình cứng. Secret đọc từ môi trường; chưa cấu hình thì trả 503 trước khi ghi đơn. Không sửa thuật toán thanh toán/chữ ký của luồng đã cấu hình.
- Production không tạo admin/customer demo; có bootstrap admin rõ ràng, một lần, không reset hoặc nâng quyền tài khoản đã có.
- Production yêu cầu thông tin Neon/JWT, hỗ trợ Render `PORT`, dùng Flyway V1 cho schema mới rồi Hibernate validate. Database cũ có quy trình adopt baseline riêng. Redis mặc định tắt ở production.
- Bổ sung `/api/health`, chạy container bằng UID 10001, tách thư mục Node build production khỏi dev. Không đưa `.env` hoặc PEM vào runtime image.
- Bỏ nội dung exception nội bộ khỏi một số phản hồi lỗi quản trị/đơn hàng, bỏ import Java không dùng.
- Viết lại README Anh/Việt, sửa link repository, bỏ ảnh chưa tồn tại và mô tả tính năng chưa có. Bổ sung hướng dẫn Render/Neon, cập nhật đóng góp, changelog và liên hệ maintainer.
- Thêm script kiểm tra file/secret trước stage và nội dung thực tế trong Git index sau stage; CI chạy kiểm tra trên snapshot commit.

## Bằng chứng kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| Backend: commerce/security, Redis thật, bootstrap, Flyway | 39 tests, không lỗi |
| Frontend API/routing/wishlist | 23 tests, không lỗi |
| Frontend build và Maven production package | Thành công |
| Build root Dockerfile từ context sạch | Thành công |
| Docker production + PostgreSQL mới, key ngẫu nhiên riêng | Flyway, JWT, register/login, RBAC, admin bootstrap thành công |
| Render-style PORT=10000, user không phải root | Hoạt động, UID 10001 |
| SPA direct routes /, /brand/all, /login | Trả frontend thành công |
| COD tạo/hủy đơn và phục hồi tồn kho | Thành công |
| Không có VNPay credentials | 503, không tạo đơn |
| Health khi DB hoạt động / DB dừng | 200 / 503 |
| Runtime image chứa PEM hoặc .env | Không có |
| npm audit, gồm dependency dev | 0 advisory được báo tại thời điểm kiểm tra |
| Script kiểm tra repository | Pass; thử thêm file khóa/staged secret giả thì bị chặn, không in giá trị secret |
| Link Markdown local và placeholder trong tài liệu công khai | Không phát hiện link hỏng/placeholder đã kiểm tra |

Container/database/network smoke test đã được xóa sau kiểm tra. Redis test dùng instance riêng. Log và công cụ kiểm tra tạm nằm trong `target/`, không commit.

## Việc cần làm trước production thật

1. **Đổi khóa/credential cũ:** lịch sử Git có private key ứng dụng ở commit `417488a` và thông tin VNPay cũ. Dùng cặp JWT production mới, không dùng test key. Thu hồi/thay credential merchant trước khi bật lại VNPay. Nếu cần xóa khỏi lịch sử, thực hiện một đợt rewrite phối hợp riêng; chưa sửa lịch sử hoặc force-push trong lần này.
2. Cấu hình Neon, Render Secret Files và bootstrap theo [deployment.md](deployment.md). Nếu database cũ có admin/customer demo, đổi mật khẩu hoặc vô hiệu hóa; bootstrap không tự sửa chúng.
3. Chạy smoke test trên Render/Neon thật. Kiểm thử local Docker không chứng minh quyền truy cập, SSL, region, tài nguyên hoặc secret trên tài khoản cloud của bạn đã đúng.

## Cải tiến tiếp theo

- Vite vẫn cảnh báo chunk frontend chính lớn hơn 500 kB; có thể lazy-load thêm các trang khách hàng và tách dữ liệu/vendor phù hợp. Build không thất bại vì cảnh báo này.
- Chuẩn hóa request/response DTO ở các controller quản trị còn nhận entity trực tiếp, tiếp tục tách các page frontend lớn khi chỉnh sửa chức năng liên quan.
- Bổ sung rate limit login, password-reset/email verification, refresh/revoke token và luồng đối soát/IPN trước khi phục vụ khách hàng thật. VNPay chưa được kiểm thử thanh toán.

Đây là các kiểm tra và chỉnh sửa có bằng chứng nêu trên, không phải chứng nhận toàn bộ mã không còn lỗi hoặc một cuộc kiểm toán bảo mật đầy đủ. Chưa commit, push hay deploy lên cloud.
