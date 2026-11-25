const swaggerSpec = {
    openapi: "3.0.3",
    info: {
        title: "HomeStay Booking & Management REST API",
        version: "1.1.0",
        description:
            "Tài liệu RESTful API cho hệ thống đặt phòng & quản lý Homestay phân quyền 3 cấp (Khách hàng - Chủ Homestay - Quản trị viên), hỗ trợ Row-level Locking chống trùng lịch, giá theo mùa, OTP Email 6 số, và thanh toán VNPay Sandbox (HMAC-SHA512).",
    },
    servers: [
        {
            url: process.env.BACKEND_URL || "http://localhost:4000",
            description: "API Server",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            ApiResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                },
            },
            SeasonalPricingItem: {
                type: "object",
                required: ["name", "startDate", "endDate", "pricePerNight"],
                properties: {
                    name: { type: "string", example: "Lễ 30/4 - 1/5" },
                    startDate: { type: "string", format: "date", example: "2026-04-30" },
                    endDate: { type: "string", format: "date", example: "2026-05-03" },
                    pricePerNight: { type: "number", example: 650000 },
                },
            },
            BookingCreateRequest: {
                type: "object",
                required: ["room", "checkInDate", "checkOutDate"],
                properties: {
                    room: { type: "integer", example: 1 },
                    checkInDate: { type: "string", format: "date", example: "2026-12-20" },
                    checkOutDate: { type: "string", format: "date", example: "2026-12-23" },
                    guests: { type: "integer", minimum: 1, example: 2 },
                    paymentMethod: { type: "string", enum: ["Pay At Hotel", "VNPay"], example: "VNPay" },
                },
            },
        },
    },
    tags: [
        { name: "Auth", description: "Đăng ký OTP, đăng nhập JWT, quên/đổi mật khẩu" },
        { name: "User", description: "Hồ sơ cá nhân và lịch sử tìm kiếm" },
        { name: "Hotels", description: "Đăng ký và quản lý hồ sơ Homestay (Partner)" },
        { name: "Rooms", description: "Tìm kiếm phòng công khai và quản lý phòng/giá mùa (Partner)" },
        { name: "Bookings", description: "Kiểm tra lịch trống, đặt phòng chống trùng lịch, duyệt/hủy/hoàn tiền" },
        { name: "Payments (VNPay)", description: "Khởi tạo thanh toán, return callback và IPN HMAC-SHA512" },
        { name: "Reviews", description: "Đánh giá sao, phản hồi chủ nhà và thống kê đánh giá" },
        { name: "Categories", description: "Danh mục Tiện ích & Khu vực (Admin CRUD)" },
        { name: "Admin", description: "Quản trị người dùng, kiểm duyệt homestay, thống kê toàn sàn" },
    ],
    paths: {
        "/api/health": {
            get: {
                tags: ["Admin"],
                summary: "Kiểm tra trạng thái máy chủ API",
                responses: { 200: { description: "OK" } },
            },
        },
        "/api/auth/send-verify-code": {
            post: {
                tags: ["Auth"],
                summary: "Gửi mã OTP 6 số xác thực đăng ký (hiệu lực 5 phút)",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    username: { type: "string" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Đã gửi OTP" }, 400: { description: "Email không hợp lệ hoặc đã tồn tại" } },
            },
        },
        "/api/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Đăng ký tài khoản (user hoặc hotelOwner) bằng OTP",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["username", "email", "password", "codeVerify"],
                                properties: {
                                    username: { type: "string" },
                                    email: { type: "string", format: "email" },
                                    password: { type: "string" },
                                    phone: { type: "string" },
                                    role: { type: "string", enum: ["user", "hotelOwner"] },
                                    codeVerify: { type: "string", example: "123456" },
                                },
                            },
                        },
                    },
                },
                responses: { 201: { description: "Đăng ký thành công, trả về JWT" }, 400: { description: "Lỗi đầu vào hoặc OTP" } },
            },
        },
        "/api/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Đăng nhập và nhận JWT Bearer Token",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", example: "khachhang@homestay.vn" },
                                    password: { type: "string", example: "password123" },
                                },
                            },
                        },
                    },
                },
                responses: { 200: { description: "Đăng nhập thành công" }, 400: { description: "Sai thông tin" }, 403: { description: "Tài khoản bị khóa" } },
            },
        },
        "/api/auth/forgot-password": {
            post: {
                tags: ["Auth"],
                summary: "Gửi OTP đặt lại mật khẩu (hiệu lực 5 phút, dùng 1 lần)",
                responses: { 200: { description: "Đã gửi mã" }, 404: { description: "Không tìm thấy email" } },
            },
        },
        "/api/auth/reset-password": {
            post: {
                tags: ["Auth"],
                summary: "Đặt lại mật khẩu mới bằng OTP",
                responses: { 200: { description: "Đặt lại thành công" }, 400: { description: "OTP sai/hết hạn" } },
            },
        },
        "/api/auth/me": {
            get: {
                tags: ["Auth"],
                security: [{ bearerAuth: [] }],
                summary: "Lấy thông tin tài khoản hiện tại",
                responses: { 200: { description: "Thành công" }, 401: { description: "Chưa đăng nhập" } },
            },
        },
        "/api/auth/change-password": {
            put: {
                tags: ["Auth"],
                security: [{ bearerAuth: [] }],
                summary: "Đổi mật khẩu tài khoản hiện tại",
                responses: { 200: { description: "Đổi mật khẩu thành công" } },
            },
        },
        "/api/user/profile": {
            put: {
                tags: ["User"],
                security: [{ bearerAuth: [] }],
                summary: "Cập nhật họ tên, số điện thoại và avatar (multipart/form-data)",
                responses: { 200: { description: "Cập nhật thành công" } },
            },
        },
        "/api/user/store-recent-search": {
            post: {
                tags: ["User"],
                security: [{ bearerAuth: [] }],
                summary: "Lưu địa điểm tìm kiếm gần đây (tối đa 3)",
                responses: { 200: { description: "Đã lưu" } },
            },
        },
        "/api/hotels": {
            post: {
                tags: ["Hotels"],
                security: [{ bearerAuth: [] }],
                summary: "Đăng ký Homestay mới (mặc định trạng thái pending chờ Admin duyệt)",
                responses: { 200: { description: "Đăng ký thành công" } },
            },
        },
        "/api/hotels/my-hotel": {
            get: {
                tags: ["Hotels"],
                security: [{ bearerAuth: [] }],
                summary: "Lấy thông tin Homestay của Chủ nhà",
                responses: { 200: { description: "Thành công" }, 403: { description: "Chỉ dành cho Partner/Admin" } },
            },
            put: {
                tags: ["Hotels"],
                security: [{ bearerAuth: [] }],
                summary: "Cập nhật hoặc khởi tạo (upsert) Homestay; tự chuyển rejected -> pending",
                responses: { 200: { description: "Cập nhật thành công" } },
            },
        },
        "/api/rooms": {
            get: {
                tags: ["Rooms"],
                summary: "Tìm kiếm & lọc phòng trống công khai thuộc Homestay đã duyệt",
                parameters: [
                    { name: "destination", in: "query", schema: { type: "string" } },
                    { name: "checkIn", in: "query", schema: { type: "string", format: "date" } },
                    { name: "checkOut", in: "query", schema: { type: "string", format: "date" } },
                    { name: "guests", in: "query", schema: { type: "integer" } },
                ],
                responses: { 200: { description: "Danh sách phòng kèm đánh giá và giá áp mùa" } },
            },
            post: {
                tags: ["Rooms"],
                security: [{ bearerAuth: [] }],
                summary: "Tạo phòng mới kèm tiện ích, ảnh (tối đa 4) và bảng giá theo mùa (Partner)",
                responses: { 200: { description: "Tạo phòng thành công" } },
            },
        },
        "/api/rooms/owner": {
            get: {
                tags: ["Rooms"],
                security: [{ bearerAuth: [] }],
                summary: "Lấy danh sách phòng của Chủ nhà",
                responses: { 200: { description: "Thành công" } },
            },
        },
        "/api/rooms/{id}": {
            get: {
                tags: ["Rooms"],
                summary: "Chi tiết phòng (chỉ Owner/Admin xem được khi Homestay chưa duyệt)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Chi tiết phòng" }, 404: { description: "Không tìm thấy" } },
            },
            put: {
                tags: ["Rooms"],
                security: [{ bearerAuth: [] }],
                summary: "Cập nhật phòng và bảng giá theo mùa (Partner)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Cập nhật thành công" } },
            },
            delete: {
                tags: ["Rooms"],
                security: [{ bearerAuth: [] }],
                summary: "Xóa phòng (Partner)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Đã xóa" } },
            },
        },
        "/api/rooms/toggle-availability": {
            post: {
                tags: ["Rooms"],
                security: [{ bearerAuth: [] }],
                summary: "Bật/tắt trạng thái nhận khách của phòng (Partner)",
                responses: { 200: { description: "Đã cập nhật" } },
            },
        },
        "/api/bookings/check-availability": {
            post: {
                tags: ["Bookings"],
                summary: "Kiểm tra phòng còn trống trong khoảng ngày",
                responses: { 200: { description: "Trả về isAvailable: true/false" } },
            },
        },
        "/api/bookings/room/{roomId}/booked-dates": {
            get: {
                tags: ["Bookings"],
                summary: "Lấy danh sách các khoảng ngày đã kín của một phòng",
                parameters: [{ name: "roomId", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Danh sách ngày kín" } },
            },
        },
        "/api/bookings/book": {
            post: {
                tags: ["Bookings"],
                security: [{ bearerAuth: [] }],
                summary: "Tạo đơn đặt phòng với Row-level Locking Transaction (chống double-booking)",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": { schema: { $ref: "#/components/schemas/BookingCreateRequest" } },
                    },
                },
                responses: { 200: { description: "Đặt phòng thành công" }, 400: { description: "Trùng lịch hoặc dữ liệu không hợp lệ" } },
            },
        },
        "/api/bookings/user": {
            get: {
                tags: ["Bookings"],
                security: [{ bearerAuth: [] }],
                summary: "Lịch sử đặt phòng của khách hàng",
                responses: { 200: { description: "Danh sách đơn đặt phòng" } },
            },
        },
        "/api/bookings/hotel": {
            get: {
                tags: ["Bookings"],
                security: [{ bearerAuth: [] }],
                summary: "Danh sách đơn đặt, doanh thu và biểu đồ 6 tháng của Chủ nhà (Partner)",
                responses: { 200: { description: "Dữ liệu dashboard" } },
            },
        },
        "/api/bookings/{id}/status": {
            put: {
                tags: ["Bookings"],
                security: [{ bearerAuth: [] }],
                summary: "Chủ nhà duyệt / hủy đơn đặt phòng",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Cập nhật thành công" } },
            },
        },
        "/api/bookings/{id}/refund": {
            put: {
                tags: ["Bookings"],
                security: [{ bearerAuth: [] }],
                summary: "Chủ nhà / Admin xác nhận đã hoàn tiền cho đơn VNPay bị hủy",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Đã xác nhận hoàn tiền" } },
            },
        },
        "/api/bookings/{id}/cancel": {
            put: {
                tags: ["Bookings"],
                security: [{ bearerAuth: [] }],
                summary: "Khách hàng hủy đơn (chặn hủy khi đã đến/qua ngày check-in)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Đã hủy đơn" }, 400: { description: "Đã đến hạn không thể hủy" } },
            },
        },
        "/api/payments/vnpay/create": {
            post: {
                tags: ["Payments (VNPay)"],
                security: [{ bearerAuth: [] }],
                summary: "Tạo URL thanh toán VNPay Sandbox ký HMAC-SHA512",
                responses: { 200: { description: "Trả về paymentUrl" } },
            },
        },
        "/api/payments/vnpay/return": {
            get: {
                tags: ["Payments (VNPay)"],
                summary: "Xác thực chữ ký VNPay trả về & xác nhận thanh toán đơn hàng",
                responses: { 200: { description: "Kết quả xác thực thanh toán" }, 400: { description: "Sai chữ ký HMAC-SHA512" } },
            },
        },
        "/api/payments/vnpay/ipn": {
            get: {
                tags: ["Payments (VNPay)"],
                summary: "Webhook IPN Server-to-Server chuẩn VNPay",
                responses: { 200: { description: "RspCode / Message theo đặc tả VNPay" } },
            },
        },
        "/api/reviews": {
            post: {
                tags: ["Reviews"],
                security: [{ bearerAuth: [] }],
                summary: "Gửi/cập nhật đánh giá sao (chỉ khách có đơn confirmed)",
                responses: { 200: { description: "Gửi đánh giá thành công" }, 403: { description: "Chưa có đơn xác nhận" } },
            },
        },
        "/api/reviews/highlights": {
            get: {
                tags: ["Reviews"],
                summary: "Đánh giá nổi bật công khai (>= 4 sao thuộc Homestay đã duyệt)",
                responses: { 200: { description: "Danh sách đánh giá nổi bật" } },
            },
        },
        "/api/reviews/hotel/{hotelId}": {
            get: {
                tags: ["Reviews"],
                summary: "Danh sách đánh giá và phản hồi chủ nhà của một Homestay",
                parameters: [{ name: "hotelId", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Danh sách đánh giá" } },
            },
        },
        "/api/reviews/owner": {
            get: {
                tags: ["Reviews"],
                security: [{ bearerAuth: [] }],
                summary: "Đánh giá & thống kê của Homestay thuộc Chủ nhà",
                responses: { 200: { description: "Thành công" } },
            },
        },
        "/api/reviews/{id}/reply": {
            put: {
                tags: ["Reviews"],
                security: [{ bearerAuth: [] }],
                summary: "Chủ nhà gửi/chỉnh sửa phản hồi công khai cho đánh giá",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Đã gửi phản hồi" } },
            },
        },
        "/api/reviews/stats": {
            get: {
                tags: ["Reviews"],
                security: [{ bearerAuth: [] }],
                summary: "Thống kê đánh giá toàn sàn & theo từng Homestay (Admin only)",
                responses: { 200: { description: "Dữ liệu thống kê" }, 403: { description: "Chỉ dành cho Admin" } },
            },
        },
        "/api/reviews/{id}": {
            delete: {
                tags: ["Reviews"],
                security: [{ bearerAuth: [] }],
                summary: "Xóa đánh giá (chỉ tác giả đánh giá hoặc Admin)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Đã xóa" }, 403: { description: "Không có quyền xóa" } },
            },
        },
        "/api/categories": {
            get: {
                tags: ["Categories"],
                summary: "Lấy danh mục tiện ích và khu vực/tỉnh thành",
                responses: { 200: { description: "Danh sách categories" } },
            },
            post: {
                tags: ["Categories"],
                security: [{ bearerAuth: [] }],
                summary: "Thêm mới tiện ích hoặc khu vực (Admin)",
                responses: { 200: { description: "Thêm thành công" } },
            },
        },
        "/api/categories/{id}": {
            put: {
                tags: ["Categories"],
                security: [{ bearerAuth: [] }],
                summary: "Cập nhật danh mục & tự động đồng bộ dữ liệu phòng/homestay (Admin)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Cập nhật thành công" } },
            },
            delete: {
                tags: ["Categories"],
                security: [{ bearerAuth: [] }],
                summary: "Xóa danh mục (Admin)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Đã xóa" } },
            },
        },
        "/api/admin/stats": {
            get: {
                tags: ["Admin"],
                security: [{ bearerAuth: [] }],
                summary: "Thống kê tổng quan toàn sàn & doanh thu 6 tháng (Admin)",
                responses: { 200: { description: "Thành công" } },
            },
        },
        "/api/admin/users": {
            get: {
                tags: ["Admin"],
                security: [{ bearerAuth: [] }],
                summary: "Danh sách toàn bộ người dùng (Admin)",
                responses: { 200: { description: "Thành công" } },
            },
        },
        "/api/admin/users/{id}/role": {
            put: {
                tags: ["Admin"],
                security: [{ bearerAuth: [] }],
                summary: "Thay đổi vai trò người dùng (chặn tự hạ quyền Admin)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Cập nhật thành công" } },
            },
        },
        "/api/admin/users/{id}/status": {
            put: {
                tags: ["Admin"],
                security: [{ bearerAuth: [] }],
                summary: "Khóa / Mở khóa tài khoản người dùng (chặn tự khóa Admin)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Cập nhật thành công" } },
            },
        },
        "/api/admin/hotels": {
            get: {
                tags: ["Admin"],
                security: [{ bearerAuth: [] }],
                summary: "Danh sách toàn bộ Homestay kèm danh sách phòng để kiểm duyệt (Admin)",
                responses: { 200: { description: "Thành công" } },
            },
        },
        "/api/admin/hotels/{id}/status": {
            put: {
                tags: ["Admin"],
                security: [{ bearerAuth: [] }],
                summary: "Phê duyệt / Từ chối Homestay kèm lý do từ chối (Admin)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { 200: { description: "Cập nhật thành công" } },
            },
        },
    },
};

export default swaggerSpec;
