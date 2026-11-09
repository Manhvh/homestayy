# 🏨 HomeStay - Nền Tảng Đặt Phòng & Quản Lý Homestay Trực Tuyến

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-5.x-black?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **Đồ án tốt nghiệp**: Xây dựng ứng dụng đặt phòng homestay theo mô hình phân quyền 3 cấp (**Khách hàng - Chủ homestay - Quản trị viên**). Hệ thống chạy độc lập 100% (*self-contained*), không phụ thuộc vào các dịch vụ trả phí bên thứ ba: sử dụng **MySQL 8.0** (Sequelize ORM), xác thực **JWT nội bộ + OTP Email 6 chữ số**, lưu trữ ảnh **Multer Local**, tối ưu hiệu năng với **React.lazy Code Splitting**, và hỗ trợ **Docker** khởi tạo dữ liệu tự động hoặc triển khai Cloud (**Vercel + Render + TiDB Cloud**).

---

## 🌟 Tổng Quan Dự Án

**HomeStay** là nền tảng đặt phòng nghỉ dưỡng và kết nối trực tiếp du khách với các chủ nhà bản địa (*Local Hosts* — lấy cảm hứng từ mô hình *Homestay.com*). Hệ thống mang đến trải nghiệm xuyên suốt từ khám phá điểm đến, lọc phòng đa tiêu chí, xem hồ sơ chủ nhà, kiểm tra lịch trống theo thời gian thực, đặt phòng an toàn chống trùng lịch (*Row-level Locking Transaction*), nhận email xác nhận kèm mã đơn (`bookingCode`) đến đánh giá & chấm điểm sao sau kỳ nghỉ.

Đồng thời, hệ thống cung cấp không gian quản trị chuyên biệt cho **Chủ homestay** (quản lý phòng, thiết lập giá theo mùa, lọc/duyệt đơn đặt phòng, gửi lại email xác nhận, theo dõi lịch lưu trú và quản lý đánh giá của khách) cùng **Quản trị viên** (duyệt tin đăng homestay, quản lý người dùng, quản trị danh mục tiện ích & tỉnh thành, kiểm duyệt đánh giá toàn sàn).

---

## ✨ Các Chức Năng Chính Theo Phân Hệ

### 🎒 1. Khách Hàng (Customer / User)
* **Xác thực bảo mật & Quản lý tài khoản**:
  * Đăng ký tài khoản kèm **xác thực mã OTP 6 chữ số (`codeVerify`)** gửi qua Email và hỗ trợ gửi lại mã OTP.
  * **Quên mật khẩu & Đặt lại mật khẩu** qua mã OTP Email ngay trên Modal xác thực.
  * Quản lý hồ sơ cá nhân (`/profile`): Cập nhật họ tên, số điện thoại, ảnh đại diện (tải ảnh từ thiết bị hoặc nhập URL) và **Đổi mật khẩu**.
* **Khám phá & Tìm kiếm đa tiêu chí**:
  * **Khám phá theo Điểm Đến Nổi Bật (*Popular Destinations*)**: Lưới địa danh du lịch trên trang chủ với bộ đếm số homestay/phòng thực tế theo từng tỉnh thành.
  * **Tìm kiếm theo địa chỉ & từ khóa**: Tìm nhanh theo số nhà, tên đường, phường/xã, thành phố hoặc tên homestay.
  * **Bộ lọc thông minh đóng/mở linh hoạt (*Collapsible Filter*)**: Lọc nhanh theo khoảng giá (`100k - 300k`, `300k - 500k`, `500k - 1.000k VNĐ`), lọc theo ngày nhận/trả phòng, sức chứa, loại phòng động, tiện ích (WiFi, Hồ bơi, Bữa sáng, BBQ...) và sắp xếp theo giá hoặc mới nhất.
  * **Danh sách Phòng yêu thích (*Wishlist / Saved Rooms*)**: Thả tim lưu phòng yêu thích vào `localStorage` và lọc nhanh danh sách **"Phòng đã lưu"**.
* **Chi tiết phòng & Kết nối Chủ nhà (*Homestay.com Experience*)**:
  * Hiển thị **Huy hiệu Chủ nhà (*Host Avatar & Name Badge*)** ngay trên từng thẻ phòng.
  * Trang chi tiết phòng cung cấp: bộ sưu tập ảnh, câu chuyện & mô tả không gian homestay, tiện ích, bảng giá theo mùa lễ/cao điểm, **Hồ sơ chi tiết Chủ nhà** (ảnh đại diện, tỉ lệ phản hồi 100%, nút gọi điện/email trực tiếp) và gợi ý **Các phòng tương tự cùng thành phố**.
  * Hiển thị **điểm trung bình sao thực tế (`averageRating`)** và tổng số đánh giá (`reviewCount`) tính toán trực tiếp từ cơ sở dữ liệu.
* **Kiểm tra lịch trống & Đặt phòng chống trùng lịch**:
  * Kiểm tra tình trạng phòng trống theo thời gian thực.
  * **Bảng bóc tách chi phí minh bạch (*Nightly Price Breakdown*)** trong Modal xác nhận đặt phòng (tự động tính giá cơ bản và phụ thu mùa cao điểm cho từng đêm).
  * Chống spam click đặt phòng bằng trạng thái khóa nút (`isLoading`) kết hợp **Database Transaction (`SELECT ... FOR UPDATE`)** ngăn chặn tuyệt đối lỗi đặt trùng phòng (*Double-booking*).
  * Tự động sinh mã đơn duy nhất (`bookingCode`, VD: `HS-20261109-AB12`), gửi **email xác nhận đặt phòng** qua Nodemailer và cập nhật trạng thái gửi thư (`isSendMail`).
* **Quản lý lịch sử đặt phòng & Đánh giá Homestay**:
  * Tra cứu đơn đặt tại trang **Đặt phòng của tôi (`/my-bookings`)**: Hỗ trợ lọc theo trạng thái (*Tất cả / Chờ duyệt / Đã xác nhận / Đã hủy*) và tìm kiếm theo mã đơn `bookingCode` hoặc tên homestay.
  * Hủy đơn đặt phòng trực tiếp nếu đơn đang ở trạng thái chờ hoặc trước ngày nhận phòng.
  * **Viết đánh giá & Vote sao (1 - 5 ⭐)**: Khách hàng có thể gửi đánh giá trực tiếp từ lịch sử chuyến đi đã xác nhận (`/my-bookings`) hoặc tại trang chi tiết phòng (`/rooms/:id`).

### 🏡 2. Chủ Nhà (Partner / Hotel Owner)
* **Đăng ký & Quản lý hồ sơ Homestay**:
  * Đăng ký homestay mới với tên, địa chỉ, số điện thoại, thành phố, mô tả chi tiết và tải ảnh trực tiếp.
  * Cập nhật thông tin và hình ảnh homestay bất cứ lúc nào tại trang quản trị (`/owner/manage-hotel`).
* **Quản lý Phòng & Giá theo mùa (*Seasonal Pricing*)**:
  * Thêm phòng mới, chỉnh sửa thông tin, bật/tắt trạng thái mở bán từng phòng (`/owner/add-room`, `/owner/list-room`).
  * Thiết lập bảng giá linh hoạt theo từng khoảng thời gian (cuối tuần, lễ Tết, mùa du lịch cao điểm).
* **Quản lý Đơn đặt phòng & Gửi Email xác nhận**:
  * Dashboard thống kê tổng quan số đơn đặt, số đơn đã duyệt và tổng doanh thu (`VNĐ`).
  * **Bộ lọc đơn đặt phòng đa năng**: Tìm kiếm và lọc nhanh theo **Mã đơn (`bookingCode`)**, **Tên khách hàng**, **Số điện thoại** và **Trạng thái đơn**.
  * Phê duyệt (*Confirm*) hoặc từ chối/hủy đơn (*Cancel*) theo thời gian thực.
  * Theo dõi trạng thái gửi email (`isSendMail`) và hỗ trợ nút **"Gửi mail" / "Gửi lại"** xác nhận đặt phòng cho khách hàng chỉ với 1 click.
* **Theo dõi lịch lưu trú (*Schedule Calendar*)**:
  * Bảng theo dõi trực quan phân loại 3 nhóm: *Khách đang lưu trú*, *Khách sắp nhận phòng*, và *Lịch sử khách đã trả phòng*.
* **Quản lý Đánh giá của Homestay (`/owner/reviews`)**:
  * Xem thống kê điểm đánh giá trung bình, phân bố từ 1 đến 5 sao của homestay mình sở hữu.
  * Lọc đánh giá theo số sao hoặc từ khóa và **xóa các đánh giá spam/không phù hợp** thuộc homestay của mình.

### 🛡️ 3. Quản Trị Viên (Admin)
* **Thống kê tổng quan toàn sàn (`/admin`)**:
  * Theo dõi tổng số người dùng, số homestay hoạt động, số homestay chờ duyệt, tổng số phòng, tổng đơn đặt và tổng doanh thu toàn hệ thống.
* **Quản lý người dùng (`/admin/users`)**:
  * Xem danh sách tài khoản, chuyển đổi vai trò (*User / Hotel Owner / Admin*) và Khóa (*Block*) hoặc Mở khóa tài khoản vi phạm.
* **Kiểm duyệt tin đăng Homestay (`/admin/hotels`)**:
  * Duyệt (*Approve*) hoặc Từ chối (*Reject*) các homestay mới đăng ký trước khi hiển thị công khai.
* **Quản lý danh mục hệ thống (`/admin/categories`)**:
  * Thêm, xem, xóa danh mục **Tiện ích (*Amenities*)** và **Khu vực / Tỉnh thành (*Cities*)**.
* **Thống kê & Kiểm duyệt đánh giá toàn sàn (`/admin/reviews`)**:
  * Biểu đồ phân bố điểm đánh giá (1 - 5 ⭐) và quyền xóa mọi đánh giá vi phạm tiêu chuẩn cộng đồng trên hệ thống.

---

## 🚀 Các Tối Ưu Kỹ Thuật Nổi Bật

1. **Phân trang đồng bộ (*Pagination — 10 mục/trang*)**:
   * Tích hợp component [`Pagination.jsx`](frontend/src/components/Pagination.jsx) trên toàn bộ **10 trang danh sách** ở cả 3 phân hệ (Danh sách phòng, Đơn đặt của tôi, Đánh giá phòng, Dashboard Chủ nhà, Danh sách phòng Chủ nhà, Đánh giá Chủ nhà, Quản lý User, Quản lý Homestay, Quản lý Danh mục, Quản lý Đánh giá Admin), tự động cuộn mượt lên đầu danh sách khi chuyển trang.
2. **Tối ưu hiệu năng với Code Splitting (`React.lazy` & `Suspense`)**:
   * Toàn bộ 17 trang trong [`App.jsx`](frontend/src/App.jsx) được tách gói tải bất đồng bộ (*Lazy Loading*), giúp giảm kích thước bundle chính xuống `~380 kB` và tăng tốc độ tải trang lần đầu.
3. **Cơ chế chống lặp thông báo (*Single-Toast Deduplication*)**:
   * Tối ưu `react-hot-toast` tại [`main.jsx`](frontend/src/main.jsx) và [`App.jsx`](frontend/src/App.jsx) đảm bảo tại mọi thời điểm chỉ hiển thị **duy nhất 1 thông báo**, tự động thay thế thông báo cũ khi có thông báo mới, không bao giờ xảy ra hiện tượng lặp 2 toast trùng nhau.
4. **Cơ sở dữ liệu 6 bảng chuẩn hóa**:
   * Gồm `users`, `hotels`, `rooms`, `bookings`, `reviews`, `categories` với đầy đủ khóa ngoại (`FOREIGN KEY`) và chỉ mục (`INDEX`) tối ưu truy vấn.

---

## 🛠️ Công Nghệ Sử Dụng

| Tầng | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS v4, Vite 7 | SPA, React Router DOM 7, Axios, React Hot Toast, Lazy Code Splitting |
| **Backend** | Node.js 20+, Express.js 5 | RESTful API, Sequelize ORM 6, Multer |
| **Database** | MySQL 8.0 / TiDB Cloud | Cơ sở dữ liệu quan hệ (6 bảng), Row-level Locking Transaction, Seed data |
| **Xác thực** | Native JWT + OTP Email | HMAC-SHA256 Token, băm mật khẩu chuẩn `crypto.scryptSync` (NIST), OTP 6 số |
| **Lưu trữ** | Local Disk Storage | Tải ảnh trực tiếp lên máy chủ tại `/uploads` |
| **Email** | Nodemailer | Gửi mã OTP xác thực đăng ký, khôi phục mật khẩu và hóa đơn đặt phòng |
| **DevOps** | Docker, Vercel, Render | Đóng gói MySQL 8.0 & phpMyAdmin qua Docker Compose; cấu hình sẵn Cloud Deploy |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
Assignment/
├── docker-compose.yml             # Cấu hình Docker cho MySQL 8.0 & phpMyAdmin
├── Dockerfile.mysql               # Dockerfile khởi tạo MySQL kèm schema.sql
├── render.yaml                    # Cấu hình triển khai tự động Backend lên Render
├── README.md                      # Tài liệu hướng dẫn đồ án
│
├── backend/                       # Máy chủ Backend (Node.js & Express 5)
│   ├── configs/
│   │   ├── db.js                  # Kết nối MySQL / TiDB Cloud bằng Sequelize (hỗ trợ SSL/TLS)
│   │   └── nodemailer.js          # Cấu hình dịch vụ gửi email SMTP (OTP & Booking)
│   ├── controllers/
│   │   ├── authController.js      # Đăng ký, xác thực OTP, đăng nhập, quên/đổi mật khẩu, cập nhật hồ sơ
│   │   ├── userController.js      # Thông tin người dùng, lịch sử tìm kiếm, cấp quyền demo
│   │   ├── hotelController.js     # Đăng ký & quản lý thông tin homestay
│   │   ├── roomController.js      # CRUD phòng, lọc đa tiêu chí, tính điểm sao thực tế, giá theo mùa
│   │   ├── bookingController.js   # Đặt phòng (Transaction Lock), lọc đơn, gửi/gửi lại email xác nhận
│   │   ├── reviewController.js    # Viết đánh giá 1-5 sao, quản lý đánh giá cho Chủ nhà & Admin
│   │   ├── categoryController.js  # CRUD danh mục tiện ích & tỉnh thành
│   │   └── adminController.js     # Quản trị user, duyệt homestay, thống kê toàn sàn
│   ├── database/
│   │   └── schema.sql             # Script DDL khởi tạo 6 bảng, khóa ngoại & dữ liệu mẫu
│   ├── middleware/
│   │   ├── authMiddleware.js      # Middleware bảo vệ JWT & phân quyền Role
│   │   └── uploadMiddleware.js    # Multer lưu trữ ảnh vào thư mục /uploads
│   ├── models/                    # Thực thể Sequelize ORM (6 Models)
│   │   ├── User.js                # Người dùng (kèm codeVerify OTP & trạng thái isBlocked)
│   │   ├── Hotel.js               # Thông tin Homestay & trạng thái kiểm duyệt
│   │   ├── Room.js                # Thông tin phòng & bảng giá theo mùa (JSON)
│   │   ├── Booking.js             # Đơn đặt phòng (kèm bookingCode & trạng thái isSendMail)
│   │   ├── Review.js              # Đánh giá & điểm sao (1-5)
│   │   ├── Category.js            # Danh mục tiện ích (amenity) & tỉnh thành (city)
│   │   └── index.js               # Thiết lập quan hệ khóa ngoại (Associations)
│   ├── routes/                    # Các tuyến API định tuyến (auth, user, hotel, room, booking, review, category, admin)
│   ├── utils/
│   │   └── authUtils.js           # Hàm băm mật khẩu Scrypt và ký/xác thực JWT
│   ├── uploads/                   # Thư mục lưu trữ hình ảnh tải lên cục bộ
│   ├── seeder.js                  # Script nạp bộ dữ liệu mẫu phong phú (npm run seed)
│   ├── .env.example               # Mẫu biến môi trường Backend
│   ├── package.json
│   └── server.js                  # Điểm khởi chạy máy chủ Express
│
└── frontend/                      # Giao diện người dùng (React 19 + Vite)
    ├── src/
    │   ├── components/
    │   │   ├── AuthModal.jsx          # Modal Đăng nhập / Đăng ký / Xác thực OTP / Quên mật khẩu
    │   │   ├── Navbar.jsx             # Thanh điều hướng chính với chỉ báo trang đang chọn
    │   │   ├── UserMenu.jsx           # Menu người dùng & chuyển đổi nhanh phân hệ
    │   │   ├── Hero.jsx               # Banner & khung tìm kiếm ngày/điểm đến
    │   │   ├── PopularDestinations.jsx# Lưới khám phá điểm đến nổi bật (Homestay.com style)
    │   │   ├── FeaturedDestination.jsx# Danh sách phòng nổi bật trên trang chủ
    │   │   ├── HotelCard.jsx          # Thẻ hiển thị phòng kèm huy hiệu Chủ nhà & nút Lưu yêu thích
    │   │   ├── Pagination.jsx         # Component phân trang tái sử dụng (10 mục/trang)
    │   │   ├── StarRating.jsx         # Hiển thị sao đánh giá động
    │   │   ├── Testimonial.jsx        # Hiển thị nhận xét tiêu biểu của khách hàng
    │   │   └── hotelOwner/            # Sidebar & Navbar dành riêng cho Chủ homestay
    │   ├── context/
    │   │   └── AppContext.jsx         # Quản lý trạng thái toàn cục (Auth, Rooms, Wishlist, Currency...)
    │   ├── pages/
    │   │   ├── Home.jsx               # Trang chủ
    │   │   ├── AllRooms.jsx           # Tìm kiếm & lọc phòng đa tiêu chí, phòng đã lưu, phân trang
    │   │   ├── RoomDetails.jsx        # Chi tiết phòng, hồ sơ chủ nhà, bóc tách giá, đặt phòng & đánh giá
    │   │   ├── MyBookings.jsx         # Lịch sử đặt phòng, lọc trạng thái, hủy đơn & viết đánh giá
    │   │   ├── Profile.jsx            # Quản lý thông tin cá nhân & đổi mật khẩu
    │   │   ├── Experience.jsx         # Trang chia sẻ trải nghiệm & đánh giá thực tế từ khách hàng
    │   │   ├── About.jsx              # Trang giới thiệu nền tảng
    │   │   ├── hotelOwner/            # Phân hệ Chủ homestay
    │   │   │   ├── Dashboard.jsx        # Bảng điều khiển, lọc đơn, duyệt đơn & gửi lại email xác nhận
    │   │   │   ├── AddRoom.jsx          # Thêm phòng & thiết lập giá theo mùa
    │   │   │   ├── ListRoom.jsx         # Danh sách phòng sở hữu (kèm phân trang)
    │   │   │   ├── ManageHotel.jsx      # Cập nhật hồ sơ Homestay
    │   │   │   ├── ScheduleCalendar.jsx # Lịch theo dõi khách lưu trú
    │   │   │   └── OwnerReviews.jsx     # Xem thống kê & xóa đánh giá của Homestay sở hữu
    │   │   └── admin/                 # Phân hệ Quản trị viên
    │   │       ├── AdminDashboard.jsx   # Thống kê tổng quan toàn sàn
    │   │       ├── AdminUsers.jsx       # Quản trị người dùng (kèm phân trang)
    │   │       ├── AdminHotels.jsx      # Duyệt tin đăng homestay (kèm phân trang)
    │   │       ├── AdminCategories.jsx  # Quản trị tiện ích & thành phố (kèm phân trang)
    │   │       └── AdminReviews.jsx     # Thống kê & kiểm duyệt đánh giá (kèm phân trang)
    │   ├── App.jsx                    # Định tuyến ứng dụng (Lazy Loading + Single Toast Limiter)
    │   └── main.jsx                   # Khởi tạo React & cấu hình deduplication cho Toaster
    ├── vercel.json                # Cấu hình rewrite SPA cho Vercel
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy (Local)

### Yêu cầu tiên quyết
* [Node.js](https://nodejs.org/) (khuyến nghị **v18** hoặc **v20 LTS**)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (nếu chạy MySQL bằng Docker) hoặc MySQL Server 8.0 cài đặt trực tiếp.

---

### Bước 1: Khởi động Cơ sở dữ liệu MySQL bằng Docker

Chạy lệnh sau tại thư mục gốc của dự án:
```bash
docker compose up -d
```
* **MySQL Database**: Chạy tại cổng `3306`, tự động khởi tạo cơ sở dữ liệu `homestay_db` và nạp cấu trúc bảng từ `backend/database/schema.sql`.
* **phpMyAdmin**: Truy cập giao diện quản trị dữ liệu tại `http://localhost:8080`
  * Tên đăng nhập: `homestay_user` (hoặc `root`)
  * Mật khẩu: `homestay_password` (hoặc `rootpassword`)

---

### Bước 2: Cấu hình và Khởi chạy Backend

1. Di chuyển vào thư mục `backend` và cài đặt thư viện:
   ```bash
   cd backend
   npm install
   ```
2. Kiểm tra hoặc tạo file `.env` trong thư mục `backend` (tham khảo `backend/.env.example`):
   ```env
   PORT=4000
   CURRENCY=VNĐ

   # Kết nối MySQL (Hỗ trợ cả biến DB_* hoặc MYSQL_*)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=homestay_user
   DB_PASSWORD=homestay_password
   DB_NAME=homestay_db

   # JWT Secret Key
   JWT_SECRET=homestay_graduation_secret_key_2026

   # Cấu hình Nodemailer gửi email (OTP xác thực & Xác nhận đặt phòng)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_app_password
   SENDER_EMAIL=your_email@gmail.com
   ```
3. Nạp bộ dữ liệu mẫu hoàn chỉnh (Seeder) cho đồ án:
   ```bash
   npm run seed
   ```
   * *Lệnh này sẽ tự động khởi tạo dữ liệu phong phú gồm: 13 người dùng (đầy đủ 3 vai trò), 25 danh mục tiện ích & tỉnh thành, 6 homestay/resort, 15 phòng nghỉ kèm bảng giá theo mùa (VNĐ), 10 đơn đặt phòng (kèm `bookingCode` và `isSendMail`) và 9 đánh giá thực tế.*
4. Khởi chạy máy chủ Backend:
   ```bash
   npm run dev
   ```
   * Backend sẽ lắng nghe tại: `http://localhost:4000`

---

### Bước 3: Cài đặt và Khởi chạy Frontend

1. Mở cửa sổ dòng lệnh mới, di chuyển vào thư mục `frontend` và cài đặt thư viện:
   ```bash
   cd frontend
   npm install
   ```
2. Tạo file `.env` trong thư mục `frontend` (nếu cần tùy chỉnh cổng Backend hoặc đơn vị tiền tệ):
   ```env
   VITE_BACKEND_URL=http://localhost:4000
   VITE_CURRENCY=VNĐ
   ```
3. Khởi chạy máy chủ giao diện:
   ```bash
   npm run dev
   ```
   * Ứng dụng Frontend sẽ chạy tại: `http://localhost:5173`

---

## ☁️ Hướng Dẫn Triển Khai Cloud (Deployment)

Dự án đã được cấu hình sẵn để triển khai lên môi trường Production miễn phí:
* **Database (TiDB Cloud / Aiven MySQL)**: Bật biến môi trường `DB_SSL=true` trên Backend để kết nối an toàn qua TLS.
* **Backend (Render)**: Sử dụng file [`render.yaml`](render.yaml) ở thư mục gốc. Sau khi deploy, chạy `npm run seed-production` để khởi tạo dữ liệu mẫu trên Cloud DB.
* **Frontend (Vercel)**: Sử dụng file [`frontend/vercel.json`](frontend/vercel.json) đã cấu hình sẵn SPA rewrites (`/* -> /index.html`). Thiết lập biến môi trường `VITE_BACKEND_URL` trỏ về URL của dịch vụ Render.

---

## 🔑 Tài Khoản Thử Nghiệm (Demo Accounts)

Hệ thống đã chuẩn bị sẵn **3 tài khoản mẫu** trong cơ sở dữ liệu cho cả 3 vai trò. Bạn có thể sử dụng tính năng **Đăng nhập nhanh 1-Click** ngay trên Modal Đăng nhập hoặc nhập thông tin thủ công:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **🎒 Khách hàng** | `khachhang@homestay.vn` | `password123` | Tìm kiếm, lưu phòng yêu thích, đặt phòng, hủy đơn, viết đánh giá & vote sao |
| **🏡 Chủ Homestay** | `chubay@homestay.vn` | `password123` | Quản lý homestay, thêm phòng, giá theo mùa, lọc/duyệt đơn, gửi mail, quản lý đánh giá |
| **🛡️ Quản trị viên** | `admin@homestay.vn` | `password123` | Thống kê toàn sàn, quản lý user, duyệt homestay, quản trị danh mục & đánh giá |

---

## 📡 Danh Sách Các Tuyến API Chính

### 1. Xác thực & Tài khoản (`/api/auth`)
* `POST /api/auth/register` - Đăng ký tài khoản mới và gửi mã OTP 6 chữ số qua email
* `POST /api/auth/verify-email` - Xác thực mã OTP (`codeVerify`) kích hoạt tài khoản và nhận JWT
* `POST /api/auth/resend-code` - Gửi lại mã xác thực OTP mới qua email
* `POST /api/auth/login` - Đăng nhập bằng email & mật khẩu, trả về token JWT
* `POST /api/auth/forgot-password` - Yêu cầu gửi mã OTP khôi phục mật khẩu qua email
* `POST /api/auth/reset-password` - Đặt lại mật khẩu mới bằng mã OTP
* `GET /api/auth/me` - Lấy thông tin tài khoản đang đăng nhập
* `PUT /api/auth/profile` - Cập nhật hồ sơ cá nhân (họ tên, số điện thoại, ảnh đại diện)
* `PUT /api/auth/change-password` - Đổi mật khẩu khi đang đăng nhập

### 2. Phòng & Homestay (`/api/rooms`, `/api/hotels`)
* `GET /api/rooms` - Lấy danh sách phòng đang mở bán (kèm điểm đánh giá `averageRating`, `reviewCount` của từng homestay)
* `GET /api/rooms/owner` - Lấy danh sách tất cả phòng thuộc homestay của Chủ nhà
* `POST /api/rooms` - Thêm phòng mới kèm tải ảnh và bảng giá theo mùa (*Chủ homestay*)
* `PUT /api/rooms/:id` - Cập nhật thông tin phòng và bảng giá theo mùa (*Chủ homestay*)
* `POST /api/rooms/toggle-availability` - Bật/tắt trạng thái mở bán phòng (*Chủ homestay*)
* `DELETE /api/rooms/:id` - Xóa phòng khỏi hệ thống (*Chủ homestay*)
* `POST /api/hotels` - Đăng ký hồ sơ homestay mới kèm ảnh tải lên
* `GET /api/hotels/mine` - Lấy thông tin homestay của Chủ nhà đang đăng nhập
* `PUT /api/hotels/mine` - Cập nhật thông tin & hình ảnh homestay (*Chủ homestay*)

### 3. Đơn Đặt Phòng (`/api/bookings`)
* `POST /api/bookings/check-availability` - Kiểm tra tình trạng phòng trống theo khoảng ngày
* `POST /api/bookings/book` - Tạo đơn đặt phòng mới (sử dụng Transaction Lock chống đặt trùng, tự sinh `bookingCode` và gửi email xác nhận)
* `GET /api/bookings/user` - Lấy danh sách đơn đặt phòng của khách hàng đang đăng nhập
* `GET /api/bookings/hotel` - Lấy danh sách đơn đặt phòng gửi về homestay, hỗ trợ lọc theo `bookingCode`, `username`, `phone`, `status` (*Chủ nhà*)
* `PUT /api/bookings/:id/status` - Phê duyệt (`confirmed`) hoặc từ chối (`cancelled`) đơn đặt (*Chủ nhà*)
* `POST /api/bookings/:id/send-mail` - Chủ động gửi hoặc gửi lại email xác nhận đặt phòng cho khách (*Chủ nhà*)
* `PUT /api/bookings/:id/cancel` - Khách hàng hủy đơn đặt phòng của mình (*Khách hàng*)

### 4. Đánh Giá & Phản Hồi (`/api/reviews`)
* `POST /api/reviews` - Khách hàng gửi đánh giá sao (1 - 5 ⭐) và nhận xét cho homestay
* `GET /api/reviews/hotel/:hotelId` - Lấy danh sách đánh giá kèm điểm trung bình của một homestay
* `GET /api/reviews/owner` - Lấy toàn bộ đánh giá và thống kê sao của homestay thuộc Chủ nhà đang đăng nhập (*Chủ nhà*)
* `GET /api/reviews/stats` - Lấy thống kê phân bố sao và toàn bộ đánh giá trên sàn (*Public / Admin*)
* `DELETE /api/reviews/:id` - Xóa đánh giá (hỗ trợ cho **Admin**, **Chủ homestay sở hữu** hoặc **Tác giả đánh giá**)

### 5. Danh Mục & Quản Trị Hệ Thống (`/api/categories`, `/api/admin`)
* `GET /api/categories` - Lấy danh sách tiện ích (`amenity`) và tỉnh thành (`city`)
* `POST /api/categories` - Thêm danh mục mới (*Admin*)
* `DELETE /api/categories/:id` - Xóa danh mục (*Admin*)
* `GET /api/admin/metrics` - Lấy số liệu thống kê tổng quan toàn sàn (*Admin*)
* `GET /api/admin/users` - Danh sách toàn bộ người dùng (*Admin*)
* `PUT /api/admin/users/:id/role` - Thay đổi vai trò tài khoản (*Admin*)
* `PUT /api/admin/users/:id/block` - Khóa hoặc mở khóa tài khoản người dùng (*Admin*)
* `GET /api/admin/hotels` - Danh sách toàn bộ homestay và trạng thái kiểm duyệt (*Admin*)
* `PUT /api/admin/hotels/:id/status` - Phê duyệt hoặc từ chối tin đăng homestay (*Admin*)

---

## 👨‍💻 Tác Giả & Bản Quyền

* **Đồ án tốt nghiệp**: Ứng dụng đặt phòng Homestay trực tuyến.
* Dự án được phát triển nhằm phục vụ mục đích nghiên cứu, học tập và bảo vệ đồ án tốt nghiệp.
