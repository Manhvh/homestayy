# 🏨 HomeStay - Nền Tảng Đặt Phòng & Quản Lý Homestay Trực Tuyến

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.x-black?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?logo=sequelize&logoColor=white)](https://sequelize.org/)
[![VNPay](https://img.shields.io/badge/VNPay-Sandbox%20HMAC--SHA512-005BAA)](https://sandbox.vnpayment.vn/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **Đồ án tốt nghiệp**: Xây dựng ứng dụng đặt phòng homestay theo mô hình phân quyền 3 cấp (**Khách hàng - Chủ homestay - Quản trị viên**). Hệ thống sử dụng **MySQL 8.0** (Sequelize ORM), xác thực **JWT nội bộ + OTP Email 6 chữ số** (ẩn mã OTP khỏi response khi gửi mail thành công), lưu trữ ảnh **Multer Local**, tích hợp thanh toán trực tuyến **VNPay Sandbox (HMAC-SHA512)**, biểu đồ thống kê doanh thu 6 tháng + xuất báo cáo CSV, tối ưu hiệu năng với **React.lazy Code Splitting**, và hỗ trợ **Docker** hoặc triển khai Cloud (**Vercel + Render + Aiven/TiDB Cloud**).

---

## 🌟 Tổng Quan Dự Án

**HomeStay** là nền tảng đặt phòng nghỉ dưỡng kết nối trực tiếp du khách với các chủ nhà bản địa (*Local Hosts*). Hệ thống mang đến trải nghiệm xuyên suốt từ khám phá điểm đến, lọc phòng đa tiêu chí với trần giá động, kiểm tra lịch ngày kín & lịch trống theo thời gian thực, đặt phòng an toàn chống trùng lịch (*Row-level Locking Transaction*), thanh toán tại homestay hoặc thanh toán trực tuyến qua **VNPay Sandbox (HMAC-SHA512)**, nhận email xác nhận kèm mã đơn (`bookingCode`) cho tới đánh giá sao và trao đổi phản hồi hai chiều với Chủ nhà.

Đồng thời, hệ thống cung cấp không gian quản trị chuyên biệt cho **Chủ homestay** (khởi tạo/cập nhật hồ sơ & ảnh đại diện homestay, quản lý phòng & bảng giá theo mùa ngay khi thêm/sửa phòng, duyệt đơn, xem lịch lưới theo tháng *Month Calendar Grid*, phản hồi đánh giá khách hàng, xem biểu đồ doanh thu 6 tháng & xuất báo cáo CSV) và **Quản trị viên** (kiểm duyệt homestay trước khi mở bán công khai, quản lý người dùng có chống tự khóa/tự hạ quyền, CRUD danh mục tiện ích & tỉnh thành, thống kê & lọc đánh giá theo từng Homestay & số sao, biểu đồ doanh thu toàn sàn & xuất báo cáo CSV).

---

## ✨ Các Chức Năng Chính Theo Phân Hệ

### 🎒 1. Khách Hàng (Customer / User)
* **Xác thực bảo mật & Quản lý tài khoản**:
  * Đăng ký tài khoản kèm **xác thực mã OTP 6 chữ số** gửi qua Email (`verifyCode` được ẩn hoàn toàn khỏi JSON response khi `mailSent === true`).
  * **Quên mật khẩu & Đặt lại mật khẩu** qua mã OTP Email ngay trên Modal xác thực.
  * Quản lý hồ sơ cá nhân (`/profile`): Cập nhật họ tên, số điện thoại, ảnh đại diện và **Đổi mật khẩu**.
* **Khám phá & Tìm kiếm đa tiêu chí**:
  * Tìm kiếm nhanh từ Banner trang chủ (không bắt buộc nhập Điểm đến để dễ dàng khám phá toàn bộ phòng trống theo ngày/số khách).
  * **Bộ lọc thông minh với trần giá động (*Dynamic Price Ceiling*)**: Tự động tính mức giá tối đa theo danh sách phòng thực tế (không giới hạn trần cứng 1.000.000 VNĐ), lọc theo khoảng giá, ngày nhận/trả phòng, sức chứa, loại phòng, tiện ích, sắp xếp và **Phòng đã lưu (*Wishlist*)**.
  * Chỉ hiển thị công khai và cho phép đặt các phòng thuộc Homestay đã được Quản trị viên phê duyệt (`status === "approved"`).
* **Kiểm tra lịch kín & Đặt phòng chống trùng lịch**:
  * Hiển thị trực quan **các khoảng ngày đã kín** của phòng ngay trong `BookingModal` (`GET /api/bookings/room/:roomId/booked-dates`) kèm cảnh báo trùng ngày tức thời.
  * **Bảng bóc tách chi phí minh bạch (*Nightly Price Breakdown*)** tự động áp dụng giá tiêu chuẩn và giá theo mùa/dịp lễ cho từng đêm.
  * Chống double-booking bằng **Database Transaction (`SELECT ... FOR UPDATE`)**.
* **Thanh toán trực tuyến VNPay Sandbox (HMAC-SHA512)**:
  * Lựa chọn linh hoạt giữa **Thanh toán tại Homestay** (`Pay At Hotel`) hoặc **Thanh toán trực tuyến VNPay** (`VNPay`) ngay khi đặt phòng.
  * Tự động xác thực chữ ký **HMAC-SHA512** ở callback `/api/payments/vnpay/return` (và webhook `/api/payments/vnpay/ipn`), cập nhật `isPaid = true`, `paidAt`, `transactionRef` và tự động xác nhận đơn.
  * Hỗ trợ nút **Thanh toán VNPay / Thanh toán lại VNPay** tại trang `/my-bookings` cho các đơn chưa thanh toán.
* **Quản lý lịch sử đặt phòng & Đánh giá Homestay (`/my-bookings`)**:
  * Lọc theo trạng thái (*Tất cả / Chờ duyệt / Đã xác nhận / Đã hủy*) và tìm kiếm theo mã đơn/tên homestay.
  * Chặn hủy đơn ở cả Backend lẫn Frontend khi ngày hiện tại đã đến hoặc qua `checkInDate`.
  * **Viết đánh giá & Vote sao (1 - 5 ⭐)**: Chỉ mở cho khách hàng có đơn đặt phòng đã xác nhận (`status === "confirmed"`), đồng thời hiển thị **phản hồi công khai từ Chủ homestay**.

### 🏡 2. Chủ Nhà (Partner / Hotel Owner)
* **Khởi tạo & Quản lý hồ sơ Homestay (`/owner-dashboard/manage-hotel`)**:
  * Đăng ký mới hoặc cập nhật hồ sơ Homestay kèm **tải ảnh đại diện trực tiếp** (`upload.single("image")` trên `POST /api/hotels` và `PUT /api/hotels/my-hotel`).
  * Hỗ trợ tự động tạo mới (upsert với `status: "pending"`) nếu tài khoản `hotelOwner` chưa có bản ghi Homestay, kèm hướng dẫn tạo Homestay ngay tại trang Danh sách phòng (`/owner-dashboard/list-room`).
  * Chủ nhà và Admin vẫn có thể xem trước trang chi tiết phòng khi Homestay đang ở trạng thái `pending` / `rejected`.
* **Quản lý Phòng & Giá theo mùa (*Seasonal Pricing*)**:
  * Thêm mới và chỉnh sửa phòng với đầy đủ giao diện **thêm / sửa / xóa đợt giá theo mùa** ngay trong cả `AddRoomModal` và `EditRoomModal`.
  * Bật/tắt trạng thái đón khách, lọc tìm kiếm và phân trang 10 mục/trang.
* **Bảng điều khiển, Biểu đồ doanh thu & Xuất CSV (`/owner-dashboard`)**:
  * Thống kê tổng số đơn, đơn đã xác nhận, **tổng doanh thu chỉ tính trên đơn `confirmed`**, doanh thu đã thu qua VNPay và số đơn chờ duyệt.
  * **Biểu đồ doanh thu 6 tháng gần nhất** trực quan kèm nút **Xuất báo cáo CSV** chuẩn UTF-8 BOM.
  * Hiển thị trạng thái thanh toán (`Đã thanh toán VNPay` / `Chưa thanh toán` / `Tại Homestay`), duyệt/hủy đơn và gửi lại email xác nhận.
* **Theo dõi lịch lưu trú (`/owner-dashboard/schedule`)**:
  * Hỗ trợ 2 chế độ xem: **Lịch lưới theo tháng (*Month Calendar Grid*)** (lọc theo phòng & trạng thái, xem chi tiết từng ngày) và **Danh sách phân nhóm** (*Đang lưu trú / Sắp nhận phòng / Lịch sử*).
* **Phản hồi Đánh giá khách hàng (`/owner-dashboard/reviews`)**:
  * Gửi và chỉnh sửa lời phản hồi công khai (`PUT /api/reviews/:id/reply`) hiển thị ở cả trang chi tiết phòng và lịch sử chuyến đi của khách.
  * Đảm bảo minh bạch: Chủ nhà không có quyền tự xóa đánh giá của khách hàng (chỉ tác giả đánh giá hoặc Admin được xóa).

### 🛡️ 3. Quản Trị Viên (Admin)
* **Thống kê tổng quan toàn sàn (`/admin`)**:
  * Theo dõi người dùng, chủ nhà, homestay đã duyệt/chờ duyệt, tổng đơn, **doanh thu thực nhận từ đơn `confirmed`**, doanh thu VNPay và điểm đánh giá trung bình.
  * **Biểu đồ doanh thu 6 tháng gần nhất toàn sàn** kèm nút **Xuất báo cáo CSV**.
* **Quản lý người dùng (`/admin/users`)**:
  * Chuyển đổi vai trò (*User / Hotel Owner / Admin*) và Khóa/Mở khóa tài khoản vi phạm.
  * **Bảo vệ tài khoản Admin**: Chặn tuyệt đối ở cả Backend lẫn Frontend việc Admin tự khóa hoặc tự hạ vai trò của chính mình.
* **Kiểm duyệt tin đăng Homestay (`/admin/hotels`)**:
  * Mọi Homestay tạo mới mặc định có `status = "pending"` và chỉ xuất hiện công khai/cho đặt phòng sau khi Admin bấm **Phê duyệt (`approved`)**.
* **Quản lý danh mục hệ thống (`/admin/categories`)**:
  * Hỗ trợ đầy đủ **Thêm, Sửa (`PUT /api/categories/:id`), Xem, Xóa** danh mục **Tiện ích (*Amenities*)** và **Khu vực / Tỉnh thành (*Cities*)**.
* **Thống kê & Kiểm duyệt đánh giá toàn sàn (`/admin/reviews`)**:
  * Bảng **thống kê điểm đánh giá chi tiết theo từng Homestay**, phân bố 1 - 5 sao, **bộ lọc theo Homestay, số sao & từ khóa**, hiển thị phản hồi của Chủ nhà và quyền xóa đánh giá vi phạm.

---

## 🛠️ Công Nghệ Sử Dụng

| Tầng | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS v4, Vite 6 | SPA, React Router DOM 7, Axios, React Hot Toast, Lazy Code Splitting, Biểu đồ doanh thu 6 tháng & Export CSV |
| **Backend** | Node.js 20+, Express.js 5 | RESTful API, Sequelize ORM 6, Multer |
| **Database** | MySQL 8.0 / TiDB Cloud / Aiven | Cơ sở dữ liệu quan hệ (6 bảng), Row-level Locking Transaction, Seed data |
| **Thanh toán** | VNPay Sandbox (v2.1.0) | Ký & xác thực chữ ký HMAC-SHA512 chuẩn VNPay (`create`, `return`, `ipn`, kèm Simulator cục bộ khi chưa cấu hình merchant key) |
| **Xác thực** | Native JWT + OTP Email | HMAC-SHA256 Token, băm mật khẩu chuẩn `crypto.scryptSync` (NIST), OTP 6 số |
| **Lưu trữ** | Cloudinary CDN + Multer | Stream ảnh trực tiếp lên Cloudinary (`homestay/avatars`, `homestay/hotels`, `homestay/rooms`), tự tối ưu `quality/format: auto`, dọn ảnh cũ khi cập nhật/xóa, có fallback `/uploads` khi dev offline |
| **Email** | Nodemailer | Gửi mã OTP, xác nhận đặt phòng và thông báo thanh toán VNPay thành công |
| **DevOps** | Docker, Vercel, Render | Đóng gói MySQL 8.0 & phpMyAdmin qua Docker Compose; cấu hình sẵn Cloud Deploy |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
Assignment/
├── docker-compose.yml               # Cấu hình Docker cho MySQL 8.0 & phpMyAdmin
├── Dockerfile.mysql                 # Dockerfile khởi tạo MySQL kèm schema.sql
├── render.yaml                      # Cấu hình triển khai tự động Backend lên Render
├── Readme.md                        # Tài liệu hướng dẫn đồ án
│
├── backend/                         # Máy chủ Backend (Node.js & Express 5)
│   ├── configs/
│   │   ├── db.js                    # Kết nối MySQL / Cloud DB bằng Sequelize (hỗ trợ SSL/TLS)
│   │   └── nodemailer.js            # Cấu hình dịch vụ gửi email SMTP
│   ├── controllers/
│   │   ├── authController.js        # Đăng ký, OTP Email (ẩn code khi mailSent=true), đăng nhập, đổi/quên mật khẩu
│   │   ├── userController.js        # Hồ sơ người dùng & lịch sử tìm kiếm
│   │   ├── hotelController.js       # Đăng ký, tải ảnh đại diện & upsert hồ sơ homestay
│   │   ├── roomController.js        # CRUD phòng, chỉ hiển thị hotel approved công khai, giá theo mùa
│   │   ├── bookingController.js     # Đặt phòng (Transaction Lock), ngày kín, chặn hủy quá hạn, thống kê 6 tháng
│   │   ├── paymentController.js     # Thanh toán VNPay Sandbox HMAC-SHA512 (create, return, ipn, simulator)
│   │   ├── reviewController.js      # Đánh giá đơn confirmed, Chủ nhà phản hồi, thống kê & lọc theo Homestay/sao
│   │   ├── categoryController.js    # CRUD danh mục tiện ích & tỉnh thành (thêm/sửa/xóa)
│   │   └── adminController.js       # Quản trị user (chống tự khóa/hạ quyền), duyệt homestay, thống kê 6 tháng
│   ├── database/
│   │   ├── schema.sql               # Script DDL khởi tạo 6 bảng đầy đủ cột mới
│   │   └── seeder.js                # Script nạp dữ liệu mẫu phong phú (6 tháng booking, VNPay, ownerReply)
│   ├── middleware/
│   │   ├── authMiddleware.js        # protect, optionalProtect, adminProtect
│   │   └── uploadMiddleware.js      # Multer lưu trữ ảnh tại /uploads
│   ├── models/                      # 6 Sequelize Models: User, Hotel, Room, Booking, Review, Category
│   ├── routes/                      # auth, user, hotel, room, booking, payment, review, category, admin
│   ├── utils/
│   │   ├── authUtils.js             # Scrypt password hashing & HMAC-SHA256 JWT
│   │   ├── mailService.js           # Email OTP, đặt phòng & thanh toán VNPay
│   │   └── statsUtils.js            # Helper ngày local & tổng hợp doanh thu 6 tháng gần nhất
│   ├── .env.example                 # Mẫu biến môi trường (bao gồm VNP_* Sandbox)
│   └── server.js                    # Điểm khởi chạy Express
│
└── frontend/                        # Giao diện người dùng (React 19 + Vite)
    └── src/
        ├── components/
        │   ├── BookingModal.jsx     # Hiển thị ngày kín, chọn Pay At Hotel / VNPay, bóc tách giá
        │   ├── Hero.jsx             # Banner & khung tìm kiếm (không bắt buộc Điểm đến)
        │   ├── HotelRegistration.jsx# Modal đăng ký Homestay kèm tải ảnh đại diện
        │   ├── RevenueChart.jsx     # Biểu đồ doanh thu 6 tháng gần nhất tái sử dụng
        │   ├── Pagination.jsx       # Component phân trang (10 mục/trang)
        │   └── hotelOwner/
        │       └── RoomModals.jsx   # AddRoomModal & EditRoomModal (hỗ trợ thêm/sửa/xóa seasonalPricing)
        ├── pages/
        │   ├── AllRooms.jsx         # Tìm kiếm & lọc phòng với trần giá động
        │   ├── RoomDetails.jsx      # Chi tiết phòng, lịch kín, đặt phòng VNPay, hiển thị phản hồi Chủ nhà
        │   ├── MyBookings.jsx       # Lịch sử đặt phòng, thanh toán lại VNPay, chặn hủy quá hạn, đánh giá
        │   ├── VnpayReturn.jsx      # Trang kết quả xác thực chữ ký VNPay (HMAC-SHA512)
        │   ├── VnpaySandboxMock.jsx # Cổng mô phỏng VNPay Sandbox cục bộ khi chưa có merchant key
        │   ├── hotelOwner/          # Dashboard (+Chart/CSV), ScheduleCalendar (Month Grid), ManageHotel, ListRoom, OwnerReviews
        │   └── admin/               # AdminDashboard (+Chart/CSV), AdminUsers, AdminHotels, AdminCategories (+Sửa), AdminReviews
        └── utils/
            ├── csvExport.js         # Xuất báo cáo CSV UTF-8 BOM
            ├── formatters.js
            └── passwordValidator.js
```

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy (Local)

### Bước 1: Khởi động Cơ sở dữ liệu MySQL bằng Docker
```bash
docker compose up -d
```
* **MySQL Database**: Cổng `3306`, cơ sở dữ liệu `homestay_db`.
* **phpMyAdmin**: `http://localhost:8080` (`homestay_user` / `homestay_password`).

### Bước 2: Cấu hình và Khởi chạy Backend
```bash
cd backend
npm install
```
Tạo file `backend/.env` từ `backend/.env.example`:
```env
PORT=4000
CURRENCY=VNĐ
JWT_SECRET=homestay_graduation_secret_key_2026
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:4000

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=homestay_user
MYSQL_PASSWORD=homestay_password
MYSQL_DATABASE=homestay_db
MYSQL_SSL=false

# SMTP Nodemailer (tùy chọn)
SENDER_EMAIL=your_email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_gmail_app_password

# VNPay Sandbox (HMAC-SHA512) - nếu để trống sẽ tự dùng VNPay Sandbox Simulator cục bộ
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/payment/vnpay-return
```

Nạp dữ liệu mẫu và chạy server:
```bash
npm run seed
npm run dev
```

### Bước 3: Cài đặt và Khởi chạy Frontend
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại `http://localhost:5173`.

---

## 🔑 Tài Khoản Thử Nghiệm (Demo Accounts)

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **🎒 Khách hàng** | `khachhang@homestay.vn` | `password123` | Tìm phòng, đặt phòng, thanh toán VNPay, hủy đơn trước ngày nhận phòng, đánh giá đơn đã xác nhận |
| **🏡 Chủ Homestay** | `chubay@homestay.vn` | `password123` | Quản lý homestay & ảnh, thêm/sửa phòng + giá mùa, lịch lưới theo tháng, phản hồi đánh giá, biểu đồ & CSV |
| **🛡️ Quản trị viên** | `admin@homestay.vn` | `password123` | Duyệt homestay, quản lý user, thêm/sửa/xóa danh mục, thống kê đánh giá theo homestay, biểu đồ & CSV |

---

## 📡 Danh Sách Các Tuyến API Chính

### 1. Xác thực & Hồ sơ (`/api/auth`, `/api/user`)
* `POST /api/auth/send-verify-code` - Gửi mã OTP đăng ký (ẩn `verifyCode` khỏi JSON khi `mailSent === true`)
* `POST /api/auth/register` - Đăng ký tài khoản mới
* `POST /api/auth/login` - Đăng nhập và cấp JWT
* `POST /api/auth/forgot-password` - Gửi mã OTP đặt lại mật khẩu
* `POST /api/auth/reset-password` - Đặt lại mật khẩu mới bằng OTP
* `GET /api/auth/me` - Lấy thông tin tài khoản hiện tại
* `PUT /api/auth/change-password` - Đổi mật khẩu
* `PUT /api/user/profile` - Cập nhật hồ sơ cá nhân & tải avatar

### 2. Homestay & Phòng (`/api/hotels`, `/api/rooms`)
* `POST /api/hotels` - Đăng ký Homestay mới (hỗ trợ `upload.single("image")`, mặc định `status: "pending"`)
* `GET /api/hotels/my-hotel` - Lấy hồ sơ Homestay của Chủ nhà
* `PUT /api/hotels/my-hotel` - Cập nhật hoặc tự khởi tạo (upsert, `status: "pending"`) Homestay kèm `upload.single("image")`
* `GET /api/rooms` - Lấy danh sách phòng đang mở bán thuộc Homestay `status === "approved"`
* `GET /api/rooms/owner` - Lấy danh sách phòng và thông tin Homestay của Chủ nhà
* `GET /api/rooms/:id` - Chi tiết phòng (Homestay `pending`/`rejected` chỉ Chủ sở hữu hoặc Admin xem được)
* `POST /api/rooms` / `PUT /api/rooms/:id` / `DELETE /api/rooms/:id` - CRUD phòng kèm `seasonalPricing`
* `POST /api/rooms/toggle-availability` - Bật/tắt nhận khách của phòng

### 3. Đơn Đặt Phòng & Thanh Toán VNPay (`/api/bookings`, `/api/payments`)
* `POST /api/bookings/check-availability` - Kiểm tra phòng trống (yêu cầu Homestay `approved`)
* `GET /api/bookings/room/:roomId/booked-dates` - Lấy các khoảng ngày đã kín của phòng
* `POST /api/bookings/book` - Tạo đơn đặt phòng (Transaction Lock, hỗ trợ `Pay At Hotel` và `VNPay`)
* `GET /api/bookings/user` - Danh sách đơn đặt phòng của khách hàng
* `GET /api/bookings/hotel` - Danh sách đơn đặt, doanh thu `confirmed` & dữ liệu biểu đồ 6 tháng của Homestay
* `PUT /api/bookings/:id/status` - Chủ nhà duyệt/hủy đơn (tự động chặn khôi phục đơn trùng lịch, gắn cờ chờ hoàn tiền nếu đã thanh toán VNPay)
* `PUT /api/bookings/:id/refund` - Chủ nhà / Admin xác nhận đã hoàn tiền cho đơn VNPay bị hủy
* `POST /api/bookings/:id/send-mail` - Gửi/gửi lại email xác nhận
* `PUT /api/bookings/:id/cancel` - Khách hủy đơn (chặn khi ngày hiện tại `>= checkInDate`, tự ghi nhận chờ hoàn tiền nếu đã thanh toán VNPay)
* `POST /api/payments/vnpay/create` - Tạo URL thanh toán VNPay Sandbox ký HMAC-SHA512 (tự hủy đơn VNPay chưa thanh toán quá 15 phút)
* `GET /api/payments/vnpay/return` - Xác thực chữ ký VNPay trả về & cập nhật `isPaid = true`, `paidAt`, `status = "confirmed"`
* `GET /api/payments/vnpay/ipn` - Webhook IPN chuẩn VNPay

### 4. Đánh Giá & Phản Hồi (`/api/reviews`)
* `POST /api/reviews` - Khách gửi đánh giá (chỉ cho phép khi có đơn `status === "confirmed"`)
* `GET /api/reviews/highlights` - Danh sách đánh giá nổi bật công khai (`>= 4★` thuộc Homestay đã duyệt)
* `GET /api/reviews/hotel/:hotelId` - Danh sách đánh giá của một Homestay (kèm `ownerReply`, `repliedAt`)
* `GET /api/reviews/owner` - Danh sách đánh giá & thống kê của Homestay thuộc Chủ nhà (`ownerProtect`)
* `PUT /api/reviews/:id/reply` - Chủ nhà gửi/chỉnh sửa phản hồi đánh giá (`ownerProtect`)
* `GET /api/reviews/stats` - Thống kê tổng quan & theo từng Homestay (chỉ dành cho *Admin*, hỗ trợ lọc `?hotelId=&rating=`)
* `DELETE /api/reviews/:id` - Xóa đánh giá (**chỉ tác giả đánh giá hoặc Admin**)

### 5. Danh Mục & Quản Trị Hệ Thống (`/api/categories`, `/api/admin`)
* `GET /api/categories` - Lấy danh mục tiện ích và tỉnh thành
* `POST /api/categories` / `PUT /api/categories/:id` / `DELETE /api/categories/:id` - Thêm / Sửa (tự đồng bộ tên tới Phòng & Homestay) / Xóa danh mục (*Admin*)
* `GET /api/admin/stats` - Thống kê toàn sàn, doanh thu đơn `confirmed` & biểu đồ 6 tháng (*Admin*)
* `GET /api/admin/users` - Danh sách người dùng (*Admin*)
* `PUT /api/admin/users/:id/role` - Đổi vai trò (chặn Admin tự hạ quyền)
* `PUT /api/admin/users/:id/status` - Khóa/mở khóa tài khoản (chặn Admin tự khóa chính mình)
* `GET /api/admin/hotels` / `PUT /api/admin/hotels/:id/status` - Kiểm duyệt Homestay kèm xem danh sách phòng & nhập lý do từ chối (*Admin*)

### 6. Tài Liệu API (Swagger) & Kiểm Thử Tự Động
* **Swagger UI (OpenAPI 3.0.3)**: Truy cập `http://localhost:4000/api-docs` (hoặc JSON tại `/api-docs.json`).
* **Unit & Security Tests** (17 test cases: mật khẩu/JWT/OTP, giá mùa 1 ngày & nhiều đợt, chữ ký VNPay HMAC-SHA512, lọc file upload XSS, Helmet & RBAC):
  ```bash
  cd backend && npm test
  ```
* **Integration & Concurrency Test** (chứng minh Row-level Lock `SELECT ... FOR UPDATE` chống đặt trùng phòng đồng thời & RBAC thực tế với MySQL):
  ```bash
  cd backend && npm run test:integration
  ```

---

## 👨‍💻 Tác Giả & Bản Quyền

* **Đồ án tốt nghiệp**: Ứng dụng đặt phòng Homestay trực tuyến.
* Dự án được phát triển nhằm phục vụ mục đích nghiên cứu, học tập và bảo vệ đồ án tốt nghiệp.
