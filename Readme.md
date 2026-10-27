# 🏨 HomeStay - Nền Tảng Đặt Phòng & Quản Lý Homestay Trực Tuyến

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.x-black?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **Đồ án tốt nghiệp**: Xây dựng ứng dụng đặt phòng homestay theo mô hình phân quyền 3 cấp (Khách hàng - Chủ homestay - Quản trị viên). Hệ thống chạy độc lập 100% (*self-contained*), không phụ thuộc vào dịch vụ bên thứ ba (đã chuyển đổi sang **MySQL**, xác thực **JWT nội bộ**, lưu trữ ảnh **Multer Local** và hỗ trợ **Docker** khởi tạo dữ liệu tự động).

---

## 🌟 Tổng Quan Dự Án

**HomeStay** là nền tảng đặt phòng nghỉ dưỡng toàn diện, hỗ trợ trải nghiệm người dùng mượt mà từ tìm kiếm, xem phòng, kiểm tra lịch trống theo thời gian thực đến đặt phòng, gửi email xác nhận và đánh giá phản hồi. 

Đồng thời, hệ thống cung cấp trang quản trị riêng biệt cho **Chủ homestay** (quản lý phòng, giá theo mùa, duyệt đơn) và **Quản trị viên** (duyệt tin đăng, quản lý người dùng, quản trị tiện ích & khu vực, thống kê đánh giá).

---

## ✨ Các Chức Năng Chính Theo Phân Hệ

### 🎒 1. Khách Hàng (Customer / User)
* **Tìm kiếm & Lọc đa tiêu chí**:
  * Tìm kiếm theo vị trí / thành phố (gợi ý tự động các điểm đến nổi tiếng).
  * Lọc theo khoảng ngày nhận / trả phòng.
  * Lọc theo mức giá và tích chọn tiện ích (WiFi, Hồ bơi, Bữa sáng, View núi...).
* **Chi tiết phòng & Tiện ích**:
  * Xem hình ảnh, mô tả, sức chứa, bảng giá theo mùa cao điểm / ngày lễ.
  * Xem danh sách đánh giá & điểm đánh giá trung bình từ khách trước.
* **Kiểm tra lịch trống theo thời gian thực**:
  * Tự động loại trừ các khoảng thời gian phòng đã có đơn được duyệt.
* **Đặt phòng & Nhận thông báo**:
  * Đặt phòng trực tuyến, thanh toán trực tiếp tại homestay khi nhận phòng.
  * Tự động gửi **email xác nhận đặt phòng** chi tiết qua Nodemailer.
* **Quản lý lịch sử đặt phòng & Hủy đơn**:
  * Xem danh sách đơn đặt, trạng thái đơn (*Chờ duyệt / Đã duyệt / Đã hủy*).
  * Hủy đơn đặt phòng trực tiếp trên giao diện nếu thay đổi lịch trình.
* **Gửi đánh giá & Phản hồi**:
  * Chấm điểm sao (1 - 5 ⭐) kèm nhận xét chi tiết sau kỳ nghỉ.

### 🏡 2. Chủ Nhà (Partner / Hotel Owner)
* **Đăng ký & Quản lý thông tin Homestay**:
  * Đăng ký homestay mới với tên, địa chỉ, liên hệ, mô tả và tải lên ảnh trực tiếp.
  * Cập nhật thông tin homestay bất cứ lúc nào tại trang quản trị.
* **Cập nhật bảng giá theo ngày / mùa (Seasonal Pricing)**:
  * Thiết lập bảng giá linh hoạt theo từng khoảng thời gian (mùa lễ, cao điểm du lịch).
* **Quản lý & Duyệt đơn đặt phòng**:
  * Dashboard thống kê tổng quan doanh thu, số đơn, số phòng.
  * Phê duyệt (*Approve*) hoặc từ chối / hủy đơn (*Reject*) theo thời gian thực.
* **Theo dõi lịch đặt phòng (Schedule Calendar)**:
  * Bảng theo dõi trực quan phân loại: *Đang lưu trú*, *Khách sắp đến*, và *Lịch sử khách trả phòng*.

### 🛡️ 3. Quản Trị Viên (Admin)
* **Thống kê tổng quan hệ thống**:
  * Số lượng người dùng, homestay, đơn đặt và tổng doanh thu toàn sàn.
* **Quản lý người dùng**:
  * Danh sách toàn bộ tài khoản; Chuyển đổi vai trò (*User / Owner / Admin*).
  * Khóa (*Block*) hoặc Mở khóa tài khoản vi phạm chính sách.
* **Duyệt tin đăng Homestay**:
  * Kiểm duyệt nội dung homestay trước khi cho phép hiển thị ra ngoài hệ thống.
* **Quản lý danh mục (Categories)**:
  * Thêm, sửa, xóa danh mục tiện ích (*amenities*) và danh mục khu vực / thành phố (*cities*).
* **Thống kê & Kiểm duyệt đánh giá**:
  * Biểu đồ phân bố điểm số đánh giá (1 - 5 sao).
  * Kiểm duyệt nội dung và xóa các phản hồi tiêu cực vi phạm tiêu chuẩn cộng đồng.

---

## 🛠️ Công Nghệ Sử Dụng

| Tầng | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS v4, Vite | Single Page Application (SPA), React Router DOM 7, React Hot Toast |
| **Backend** | Node.js 20+, Express.js 5 | RESTful API, Sequelize ORM 6, Multer |
| **Database** | MySQL 8.0 | Cơ sở dữ liệu quan hệ, quan hệ khóa ngoại (Foreign Keys), Indexes, Seed data |
| **Xác thực** | Native JWT Authentication | HMAC-SHA256 Token, mã hóa mật khẩu chuẩn `crypto.scryptSync` (NIST) |
| **Lưu trữ** | Local Disk Storage | Tải ảnh trực tiếp lên máy chủ tại `/uploads` (thay thế Cloudinary) |
| **Email** | Nodemailer | Gửi thư điện tử xác nhận đặt phòng tự động qua SMTP |
| **Container** | Docker & Docker Compose | Đóng gói MySQL 8.0 và phpMyAdmin, tự động nạp `schema.sql` |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
Assignment/
├── docker-compose.yml             # Cấu hình Docker cho MySQL 8.0 & phpMyAdmin
├── Dockerfile.mysql              # Dockerfile độc lập cho MySQL
├── README.md                      # Tài liệu hướng dẫn đồ án
│
├── backend/                       # Máy chủ Backend (Node.js & Express)
│   ├── configs/
│   │   ├── db.js                 # Kết nối MySQL bằng Sequelize (tự tạo DB)
│   │   └── nodemailer.js         # Cấu hình dịch vụ gửi email xác nhận
│   ├── controllers/
│   │   ├── authController.js     # Đăng ký, đăng nhập JWT, lấy thông tin cá nhân
│   │   ├── userController.js     # Lịch sử tìm kiếm, cấp quyền admin demo
│   │   ├── hotelController.js    # Đăng ký & quản lý hồ sơ homestay
│   │   ├── roomController.js     # CRUD phòng, lọc theo ngày, bảng giá mùa
│   │   ├── bookingController.js  # Đặt phòng, kiểm tra lịch trống, gửi email
│   │   ├── reviewController.js   # Đánh giá 1-5 sao, thống kê sao
│   │   ├── categoryController.js # CRUD danh mục tiện ích & khu vực
│   │   └── adminController.js    # Quản trị user, duyệt homestay, số liệu sàn
│   ├── database/
│   │   └── schema.sql            # Script DDL tạo bảng, khóa ngoại & seed data
│   ├── middleware/
│   │   ├── authMiddleware.js     # Middleware bảo vệ JWT & kiểm tra role Admin
│   │   └── uploadMiddleware.js   # Multer lưu trữ ảnh vào thư mục local /uploads
│   ├── models/                   # Thực thể Sequelize ORM
│   │   ├── User.js               # Người dùng & mật khẩu băm
│   │   ├── Hotel.js              # Thông tin Homestay & trạng thái duyệt
│   │   ├── Room.js               # Thông tin phòng & giá theo mùa
│   │   ├── Booking.js            # Đơn đặt phòng
│   │   ├── Review.js             # Đánh giá & phản hồi
│   │   ├── Category.js           # Tiện ích & thành phố
│   │   └── index.js              # Thiết lập quan hệ (Associations)
│   ├── routes/                   # Các tuyến API định tuyến
│   ├── utils/
│   │   └── authUtils.js          # Hàm băm Scrypt và tạo/kiểm tra JWT
│   ├── uploads/                  # Thư mục chứa hình ảnh tải lên cục bộ
│   ├── .env                      # Biến môi trường Backend
│   ├── .env.example              # Mẫu biến môi trường
│   ├── package.json
│   └── server.js                 # Điểm khởi chạy máy chủ Express
│
└── frontend/                      # Giao diện người dùng (React 19)
    ├── src/
    │   ├── components/
    │   │   ├── AuthModal.jsx     # Modal Đăng nhập / Đăng ký & nút Demo 1-click
    │   │   ├── UserMenu.jsx      # Menu thả xuống người dùng & phân quyền
    │   │   ├── Navbar.jsx        # Thanh điều hướng chính
    │   │   ├── Hero.jsx          # Banner & khung tìm kiếm ngày/khách
    │   │   ├── HotelCard.jsx     # Thẻ hiển thị phòng homestay
    │   │   └── hotelOwner/       # Component dành cho chủ homestay
    │   ├── context/
    │   │   └── AppContext.jsx    # Quản lý trạng thái toàn cục (Auth, Rooms...)
    │   ├── pages/
    │   │   ├── Home.jsx          # Trang chủ
    │   │   ├── AllRooms.jsx      # Danh sách phòng kèm bộ lọc đa tiêu chí
    │   │   ├── RoomDetails.jsx   # Chi tiết phòng, đánh giá sao, đặt phòng
    │   │   ├── MyBookings.jsx    # Lịch sử đơn đặt phòng của tôi & hủy đơn
    │   │   ├── hotelOwner/       # Phân hệ Chủ homestay
    │   │   │   ├── Dashboard.jsx        # Bảng điều khiển duyệt đơn
    │   │   │   ├── AddRoom.jsx          # Thêm phòng & giá theo mùa
    │   │   │   ├── ListRoom.jsx         # Danh sách phòng sở hữu
    │   │   │   ├── ManageHotel.jsx      # Cập nhật thông tin Homestay
    │   │   │   └── ScheduleCalendar.jsx # Lịch theo dõi khách lưu trú
    │   │   └── admin/            # Phân hệ Quản trị viên
    │   │       ├── AdminDashboard.jsx   # Thống kê tổng quan sàn
    │   │       ├── AdminUsers.jsx       # Quản trị & khóa tài khoản
    │   │       ├── AdminHotels.jsx      # Duyệt tin đăng homestay
    │   │       ├── AdminCategories.jsx  # Quản trị tiện ích & thành phố
    │   │       └── AdminReviews.jsx     # Thống kê & kiểm duyệt đánh giá
    │   ├── App.jsx               # Cấu hình các tuyến đường dẫn (Routing)
    │   └── main.jsx
    ├── eslint.config.js          # Cấu hình ESLint (kèm polyfill tương thích)
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu tiên quyết
* [Node.js](https://nodejs.org/) (khuyến nghị **v18** hoặc **v20 LTS**)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (nếu chạy MySQL bằng Docker)

---

### Bước 1: Khởi động Cơ sở dữ liệu MySQL bằng Docker

Chạy lệnh sau tại thư mục gốc của dự án:
```bash
docker compose up -d
```
* **MySQL Database**: Chạy tại cổng `3306`, tự động khởi tạo cơ sở dữ liệu `homestay_db` và nạp toàn bộ dữ liệu mẫu từ `schema.sql`.
* **phpMyAdmin**: Truy cập giao diện quản trị dữ liệu tại: `http://localhost:8080`
  * Tên đăng nhập: `homestay_user` (hoặc `root`)
  * Mật khẩu: `homestay_password` (hoặc `rootpassword`)

---

### Bước 2: Cấu hình và Khởi chạy Backend

1. Mở cửa sổ dòng lệnh và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Kiểm tra file cấu hình `.env` (đã được thiết lập sẵn khớp với Docker):
   ```env
   PORT=4000
   CURRENCY=$
   
   # Kết nối MySQL
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=homestay_user
   MYSQL_PASSWORD=homestay_password
   MYSQL_DATABASE=homestay_db
   
   # JWT Secret Key
   JWT_SECRET=homestay_graduation_secret_key_2026
   
   # Cấu hình Nodemailer gửi email (Tùy chọn)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_app_password
   SENDER_EMAIL=your_email@gmail.com
   ```
3. Khởi chạy máy chủ Backend:
   ```bash
   npm run dev
   # Hoặc: node server.js
   ```
   * Backend sẽ lắng nghe tại: `http://localhost:4000`

---

### Bước 3: Cài đặt và Khởi chạy Frontend

1. Mở cửa sổ dòng lệnh mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Khởi chạy máy chủ giao diện:
   ```bash
   npm run dev
   ```
   * Ứng dụng Frontend sẽ chạy tại: `http://localhost:5173`

---

## 🔑 Tài Khoản Thử Nghiệm (Demo Accounts)

Hệ thống đã chuẩn bị sẵn **3 tài khoản mẫu** trong cơ sở dữ liệu cho cả 3 vai trò. Bạn có thể sử dụng tính năng **Đăng nhập nhanh 1-Click** ngay trên Modal Đăng nhập hoặc đăng nhập thủ công:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **🎒 Khách hàng** | `khachhang@homestay.vn` | `password123` | Tìm kiếm, xem lịch trống, đặt phòng, xem lịch sử, gửi đánh giá |
| **🏡 Chủ Homestay** | `chubay@homestay.vn` | `password123` | Đăng ký homestay, thêm phòng, cài đặt giá theo mùa, duyệt đơn |
| **🛡️ Quản trị viên** | `admin@homestay.vn` | `password123` | Bảng điều khiển Admin, quản lý user, duyệt homestay, quản trị danh mục |

> [!TIP]
> Bạn cũng có thể tự do nhấn nút **"Đăng ký"** để tạo tài khoản mới bất kỳ lúc nào mà không cần cấu hình email xác minh phức tạp.

---

## 📡 Danh Sách Các Tuyến API Chính

### 1. Xác thực (Authentication)
* `POST /api/auth/register` - Đăng ký tài khoản mới (Khách hàng hoặc Chủ homestay)
* `POST /api/auth/login` - Đăng nhập tài khoản bằng email & mật khẩu, trả về token JWT
* `GET /api/auth/me` - Lấy thông tin tài khoản đang đăng nhập

### 2. Phòng & Homestay (Rooms & Hotels)
* `GET /api/rooms` - Lấy danh sách phòng (kèm bộ lọc điểm đến, khoảng ngày, mức giá, tiện ích)
* `GET /api/rooms/:id` - Lấy thông tin chi tiết của một phòng cụ thể
* `POST /api/rooms` - Thêm phòng mới kèm ảnh tải lên và giá theo mùa (*Chủ homestay*)
* `PUT /api/rooms/:id` - Chỉnh sửa thông tin phòng (*Chủ homestay*)
* `DELETE /api/rooms/:id` - Xóa phòng khỏi hệ thống (*Chủ homestay*)
* `POST /api/hotels` - Đăng ký homestay mới kèm ảnh tải lên
* `GET /api/hotels/mine` - Lấy thông tin homestay của chủ nhà đang đăng nhập
* `PUT /api/hotels/mine` - Cập nhật thông tin homestay

### 3. Đơn Đặt Phòng (Bookings)
* `GET /api/bookings/check-availability` - Kiểm tra tình trạng phòng trống theo ngày
* `POST /api/bookings` - Tạo đơn đặt phòng mới (tự động tính giá mùa và gửi email xác nhận)
* `GET /api/bookings/user` - Lấy danh sách đơn đặt phòng của khách hàng
* `GET /api/bookings/hotel` - Lấy danh sách đơn đặt phòng gửi về homestay (*Chủ nhà*)
* `PUT /api/bookings/:id/status` - Phê duyệt hoặc từ chối đơn đặt (*Chủ nhà*)
* `PUT /api/bookings/:id/cancel` - Hủy đơn đặt phòng (*Khách hàng*)

### 4. Đánh Giá & Phản Hồi (Reviews)
* `POST /api/reviews` - Gửi đánh giá sao (1-5 ⭐) và nhận xét
* `GET /api/reviews/hotel/:hotelId` - Lấy danh sách đánh giá của một homestay
* `GET /api/reviews/stats` - Lấy thống kê phân bố sao toàn sàn (*Admin*)
* `DELETE /api/reviews/:id` - Xóa đánh giá vi phạm tiêu chuẩn (*Admin*)

### 5. Danh Mục & Quản Trị (Categories & Admin)
* `GET /api/categories` - Lấy danh mục tiện ích và thành phố
* `POST /api/categories` - Thêm danh mục mới (*Admin*)
* `DELETE /api/categories/:id` - Xóa danh mục (*Admin*)
* `GET /api/admin/metrics` - Lấy số liệu thống kê toàn bộ sàn (*Admin*)
* `GET /api/admin/users` - Danh sách người dùng & trạng thái khóa (*Admin*)
* `PUT /api/admin/users/:id/role` - Đổi vai trò tài khoản (*Admin*)
* `PUT /api/admin/users/:id/block` - Khóa hoặc mở khóa tài khoản (*Admin*)
* `GET /api/admin/hotels` - Danh sách homestay chờ duyệt (*Admin*)
* `PUT /api/admin/hotels/:id/status` - Phê duyệt hoặc từ chối homestay (*Admin*)

---

## 👨‍💻 Tác Giả & Bản Quyền

* **Đồ án tốt nghiệp**: Ứng dụng đặt phòng Homestay trực tuyến.
* Dự án được phát triển nhằm phục vụ mục đích nghiên cứu, học tập và bảo vệ đồ án tốt nghiệp.
