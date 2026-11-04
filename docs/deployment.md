# Render + Neon: hướng dẫn triển khai PhoneZone

## 1. Chuẩn bị mã nguồn

- Chạy test/build trong README, kiểm tra `git diff` và file sẽ commit.
- Chạy `node scripts/check-repository.mjs` trước stage và thêm `--staged` sau stage.
- Không commit `.env`, private key, database dump, `target`, `node_modules`, `.agents`, `.local`.
- `src/test/resources/testPrivateKey.pem` là fixture công khai, không được dùng để ký JWT production.
- Lịch sử Git cũ đã chứa khóa ứng dụng và thông tin VNPay. Dùng khóa JWT production mới; thay/thu hồi thông tin merchant cũ trước khi bật lại thanh toán. Xóa ở commit mới không xóa nội dung trong lịch sử. Nếu muốn làm sạch lịch sử, cần thực hiện riêng và phối hợp các clone/fork trước khi rewrite/force-push.

## 2. Tạo Neon PostgreSQL

Tạo project/branch và database, lấy host, database, role, password từ Connect trong Neon Console. Chọn khu vực gần Render. Dùng JDBC URL, không dùng nguyên URI bắt đầu bằng `postgresql://`:

```text
DB_JDBC_URL=jdbc:postgresql://<neon-host>:5432/<database>?sslmode=require
DB_USERNAME=<neon-role>
DB_PASSWORD=<neon-password>
```

Không nhúng mật khẩu vào JDBC URL. Hướng dẫn này dùng endpoint **direct** cho dịch vụ nhỏ và Flyway migration; pool JDBC production tối đa 5 kết nối. Nếu đổi sang pooled endpoint, cần kiểm tra riêng khả năng tương thích với migration/transaction của cấu hình đó.

### Database mới, schema public trống

Giữ cấu hình mặc định: production chạy Flyway `V1__initial_schema.sql`, sau đó Hibernate kiểm tra schema. Không cần chạy SQL thủ công. Flyway lưu lịch sử nên các lần khởi động sau không tạo lại bảng. Không tự bật `baseline-on-migrate`, `drop-and-create` hoặc `update` trên production.

Ứng dụng tạo một số coupon mặc định khi bảng coupon rỗng; không tự tạo sản phẩm, đơn hàng hoặc tài khoản demo. Thêm sản phẩm qua admin hoặc khôi phục dữ liệu do bạn kiểm tra.

### Database đang có dữ liệu

**Không chạy migration V1 tạo bảng lên schema hiện hữu.** Sao lưu và thử trên một Neon branch/bản sao trước:

1. Đối chiếu schema với [V1](../src/main/resources/db/migration/V1__initial_schema.sql), gồm cột, FK, unique constraints và sequence Panache (increment 50). V1 là baseline của schema hiện tại, không phải script nâng cấp mọi phiên bản cũ.
2. Nếu database thiếu các cột order của đợt sửa trước, review và áp dụng [SQL bổ sung](migrations/20261103_order_integrity.sql) trên bản sao trước. Script này chỉ bổ sung phần order, không bảo đảm toàn bộ schema đã khớp V1.
3. Chỉ khi toàn bộ schema tương thích và chưa có Flyway history: đặt tạm `QUARKUS_FLYWAY_BASELINE_ON_MIGRATE=true`, `QUARKUS_FLYWAY_BASELINE_VERSION=1` cho một lần deploy. Flyway ghi nhận schema hiện tại ở version 1 và bỏ qua V1.
4. Deploy, xác nhận schema validation và chức năng thành công, sau đó bỏ hai biến tạm. Các thay đổi sau dùng V2, V3...; không sửa V1 đã áp dụng.

Không bật baseline để bỏ qua lỗi chưa hiểu. Nếu đã có Flyway history, kiểm tra version/checksum trước; không xóa bảng history để ép deploy.

Nếu restore backup cũ, kiểm tra tài khoản `admin`/`customer`: chúng có thể vẫn dùng mật khẩu demo. Bootstrap mới không đổi mật khẩu tài khoản đã tồn tại; đổi mật khẩu hoặc vô hiệu hóa tài khoản demo trước khi public.

## 3. JWT production

Sinh cặp riêng với development, lưu trong thư mục đã được Git bỏ qua:

```sh
node scripts/setup-dev-keys.mjs --production
```

Script tạo `.local/production-keys/privateKey.pem` (RSA 2048, PKCS#8) và `publicKey.pem`, không ghi đè cặp đã tồn tại. Không dùng lại khóa cũ trong Git hoặc fixture test.

Render → Web Service → Environment → Secret Files: thêm `privateKey.pem`, `publicKey.pem`, dán nội dung tương ứng. Đặt:

```text
JWT_PRIVATE_KEY_LOCATION=/etc/secrets/privateKey.pem
JWT_PUBLIC_KEY_LOCATION=/etc/secrets/publicKey.pem
```

Giữ cặp khóa ổn định giữa các lần deploy để phiên đăng nhập không bị mất hiệu lực ngoài ý muốn. Khi chủ động thay khóa, người dùng cần đăng nhập lại. Docker image không đóng gói khóa từ máy local.

Dockerfile giữ user `phonezone` không phải root và thêm nhóm `1000` để đọc Render Secret Files. Dùng `USER phonezone` để Docker giữ các nhóm bổ sung; khai báo `USER 10001:10001` sẽ bỏ các nhóm đó. Nếu thay Dockerfile, giữ quyền đọc Secret Files theo [hướng dẫn Render](https://render.com/docs/docker-secrets).

Entrypoint của image kiểm tra các biến database/JWT bắt buộc và quyền đọc file khóa trước khi chạy Java. Khi thiếu cấu hình, log chỉ nêu tên biến và hướng xử lý, không in password, URL kết nối hoặc nội dung key. Dòng `[PhoneZone] Configuration preflight passed; starting Quarkus.` xác nhận các kiểm tra này đã qua; nó không xác nhận database kết nối được hoặc Flyway thành công.

## 4. Render Web Service

Kết nối repository GitHub, chọn **Docker**, Dockerfile `./Dockerfile`, build context tại gốc repository. Giữ Docker build/start mặc định; không cần build frontend thành một Static Site riêng. Không cần khai báo Maven/npm Build Command trong Docker service.

Cấu hình Health Check Path: `/api/health`. Ứng dụng bind `0.0.0.0` và đọc `PORT` do Render cấp. Không đặt `QUARKUS_HTTP_PORT=8080` trên Render vì biến này sẽ ghi đè cấu hình `PORT`.

Các biến môi trường:

| Biến | Giá trị |
| --- | --- |
| `DB_JDBC_URL` | JDBC URL Neon có `sslmode=require` |
| `DB_USERNAME`, `DB_PASSWORD` | Role/password Neon |
| `JWT_PRIVATE_KEY_LOCATION` | `/etc/secrets/privateKey.pem` |
| `JWT_PUBLIC_KEY_LOCATION` | `/etc/secrets/publicKey.pem` |
| `CORS_ORIGINS` | Origin HTTPS thực tế, ví dụ `https://phonezone-app.onrender.com`; không thêm dấu `/` cuối |
| `CATALOG_CACHE_ENABLED` | `false` nếu chưa có Redis riêng |
| `VNPAY_RETURN_URL` | `https://<render-service>.onrender.com/api/payment/vnpay-return` nếu sau này bật lại VNPay |

Không copy `.env` local lên Render vì URL database, CORS, đường dẫn khóa và cache namespace khác production. Docker chạy Java 21 bằng user không phải root, giới hạn heap theo phần trăm RAM; cần chọn tài nguyên đủ cho ứng dụng và theo dõi log khi khởi động.

### Tạo admin lần đầu

Trên database chưa có admin, đặt tạm:

```text
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_USERNAME=<username-gom-chu-so-gach-duoi-3-den-50-ky-tu>
BOOTSTRAP_ADMIN_EMAIL=<email-admin>
BOOTSTRAP_ADMIN_PASSWORD=<mat-khau-rieng-it-nhat-12-ky-tu>
```

Deploy và đăng nhập kiểm tra quyền admin. Sau đó bỏ password bootstrap và đặt `BOOTSTRAP_ADMIN_ENABLED=false`, deploy lại. Mật khẩu tuân theo bcrypt tối đa 72 byte UTF-8.

Bootstrap chỉ tạo khi chưa có `ROLE_ADMIN`, không ghi đè, reset mật khẩu hoặc nâng quyền user trùng username/email. Nếu tạo thất bại, kiểm tra log và định danh; không bật tạo demo user trên production.

### Redis tùy chọn

Render Web Service + Neon chưa đủ để có Redis. Nếu dùng Redis riêng, thêm:

```text
CATALOG_CACHE_ENABLED=true
REDIS_URL=rediss://<redis-host>:<port>
CATALOG_CACHE_NAMESPACE=phonezone:catalog:prod:v1
CATALOG_CACHE_TTL=60s
```

Đây chỉ là dạng URL minh họa; dùng URI/credentials/TLS do nhà cung cấp yêu cầu và lưu trong Render Environment. Namespace phải tách theo môi trường/database. Redis lỗi sẽ quay về PostgreSQL; không dùng cache này cho session. Xem [chi tiết cache](redis-cache.md).

### VNPay

Tạm thời để `VNPAY_TMN_CODE`, `VNPAY_SECRET_KEY` trống. Luồng thanh toán/chữ ký/callback hiện có được giữ; chỉ thay nơi cấp secret và chặn tạo đơn khi chưa cấu hình. Khi sandbox hoạt động lại cần kiểm thử end-to-end, đối soát, callback/IPN và quản lý trạng thái trước khi dùng thật. Không khẳng định thanh toán hoạt động chỉ vì website deploy thành công.

## 5. Kiểm tra sau deploy

- `/api/health` trả `200` với `{"status":"UP"}`; log Flyway hoàn tất và schema validation không lỗi.
- `/` và truy cập trực tiếp `/brand/all`, `/login` vẫn trả SPA; `/api/...` trả API thay vì HTML fallback.
- Đăng ký, login, reload trang, logout; tài khoản thường không mở được API admin.
- Đăng nhập admin, tạo sản phẩm, dùng tài khoản thường kiểm tra giỏ/đơn COD, hủy đơn và tồn kho.
- Xác nhận tài khoản demo/mật khẩu cũ không sử dụng được, không có private key hoặc `.env` trong commit mới.

Mã đã được kiểm thử local; các bước này vẫn cần chạy trên môi trường Render/Neon thật với secret và dữ liệu của bạn.

## Chẩn đoán nhanh

| Hiện tượng | Kiểm tra |
| --- | --- |
| Không bind được cổng | `PORT`, host, biến `QUARKUS_HTTP_PORT` ghi đè |
| Database connection failed | JDBC prefix, host/role/password, `sslmode=require` |
| Non-empty schema / Flyway baseline error | Phân biệt database mới và cũ; không bật baseline tùy tiện |
| Schema validation failed | Schema cũ chưa khớp, migration còn thiếu hoặc sai database |
| Login lỗi ký/verify JWT | Secret Files đúng cặp, tên file/đường dẫn, không dùng test key |
| JWT file permission denied | User container thuộc nhóm 1000; không chỉ khai báo UID:GID làm mất nhóm bổ sung |
| Admin không tồn tại | Bootstrap env, log khởi động, database đang kết nối |
| Catalog trống | Chưa nhập dữ liệu; ứng dụng không tự nạp danh mục production |
| Redis refused | Tắt cache hoặc cấp URI Redis riêng |

Nếu deploy chỉ hiện `Exited with status 1` mà thiếu exception, mở trang **Logs** của dịch vụ và bỏ bộ lọc để xem runtime log. Có thể đặt tạm `QUARKUS_LOG_CONSOLE_ENABLED=true`, `QUARKUS_LOG_CONSOLE_LEVEL=INFO`, `QUARKUS_LOG_LEVEL=INFO` rồi deploy lại để lấy thông báo lỗi khởi động. Exit code 1 tự nó không xác định được lỗi JWT, database, Flyway hay tài nguyên; cần đọc exception trước khi đổi cấu hình liên quan.

Tài liệu chính thức: [Render Docker](https://render.com/docs/docker), [Render Web Services](https://render.com/docs/web-services), [Render Environment/Secret Files](https://render.com/docs/configure-environment-variables), [Neon Java/JDBC](https://neon.com/docs/guides/java).
