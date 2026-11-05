import { sequelize, User, Hotel, Room, Booking, Review, Category } from "../models/index.js";
import { hashPassword } from "../utils/authUtils.js";

/**
 * ========================================================
 * SEEDER CHUẨN CHO DỰ ÁN HOMESTAY GRADUATION PROJECT
 * ========================================================
 * Bao gồm đầy đủ dữ liệu chân thực cho:
 * 1. Users (Admin, Hotel Owner, Customer)
 * 2. Categories (15 Tỉnh/Thành phố & 10 Tiện ích phổ biến)
 * 3. Hotels (6 Homestay & Resort thực tế tại các điểm du lịch)
 * 4. Rooms (18 phòng đa dạng loại: Đơn, Đôi, VIP, Gia đình kèm giá theo mùa)
 * 5. Bookings (Đang lưu trú, Sắp tới, Chờ duyệt, Lịch sử, Đã hủy)
 * 6. Reviews (Đánh giá & phản hồi thực tế từ khách du lịch)
 * ========================================================
 */

export const seedDatabase = async () => {
    console.log("🚀 Database Seeding...");

    try {
        // Kiểm tra kết nối cơ sở dữ liệu
        await sequelize.authenticate();
        console.log("✅ Connect MySQL success");

        // Tạm thời vô hiệu hóa kiểm tra khóa ngoại để dọn sạch dữ liệu cũ an toàn
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
        await Review.destroy({ where: {}, truncate: true });
        await Booking.destroy({ where: {}, truncate: true });
        await Room.destroy({ where: {}, truncate: true });
        await Hotel.destroy({ where: {}, truncate: true });
        await Category.destroy({ where: {}, truncate: true });
        await User.destroy({ where: {}, truncate: true });
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
        console.log("🧹 Clean old data");

        // ==========================================
        // 1. SEED USERS (Tài khoản người dùng)
        // Mật khẩu mặc định cho tất cả tài khoản: password123
        // ==========================================
        const defaultPassword = hashPassword("password123");

        const usersData = [
            // Admin Accounts
            {
                id: "user_admin_01",
                username: "Quản Trị Viên (Admin)",
                email: "admin@homestay.vn",
                password: defaultPassword,
                phone: "0901234567",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250",
                role: "admin",
                isBlocked: false,
                recentSearchedCities: ["Đà Lạt", "Đà Nẵng", "Sa Pa"]
            },
            {
                id: "user_admin_02",
                username: "Super Admin System",
                email: "admin@homestay.com",
                password: defaultPassword,
                phone: "0909888999",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250",
                role: "admin",
                isBlocked: false,
                recentSearchedCities: ["Hà Nội", "TP. Hồ Chí Minh"]
            },

            // Hotel Owners (Chủ homestay đối tác)
            {
                id: "user_owner_01",
                username: "Trần Văn Chủ Nhà",
                email: "chubay@homestay.vn",
                password: defaultPassword,
                phone: "0912345678",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250",
                role: "hotelOwner",
                isBlocked: false,
                recentSearchedCities: ["Đà Lạt"]
            },
            {
                id: "user_owner_02",
                username: "Nguyễn Hoàng Long",
                email: "owner.danang@homestay.vn",
                password: defaultPassword,
                phone: "0918765432",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250",
                role: "hotelOwner",
                isBlocked: false,
                recentSearchedCities: ["Đà Nẵng", "Hội An"]
            },
            {
                id: "user_owner_03",
                username: "Lê Văn Hùng",
                email: "owner.sapa@homestay.vn",
                password: defaultPassword,
                phone: "0934567890",
                image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=250",
                role: "hotelOwner",
                isBlocked: false,
                recentSearchedCities: ["Sa Pa", "Hà Nội"]
            },
            {
                id: "user_owner_04",
                username: "Phạm Thu Thảo",
                email: "owner.phuquoc@homestay.vn",
                password: defaultPassword,
                phone: "0945678901",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250",
                role: "hotelOwner",
                isBlocked: false,
                recentSearchedCities: ["Phú Quốc"]
            },
            {
                id: "user_owner_05",
                username: "Vũ Đình Trọng",
                email: "owner.hanoi@homestay.vn",
                password: defaultPassword,
                phone: "0967890123",
                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250",
                role: "hotelOwner",
                isBlocked: false,
                recentSearchedCities: ["Hà Nội", "Ninh Bình"]
            },
            {
                id: "user_owner_06",
                username: "Đặng Quỳnh Như",
                email: "owner.pending@homestay.vn",
                password: defaultPassword,
                phone: "0978901234",
                image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=250",
                role: "hotelOwner",
                isBlocked: false,
                recentSearchedCities: ["TP. Hồ Chí Minh", "Vũng Tàu"]
            },

            // Regular Customers (Du khách)
            {
                id: "user_guest_01",
                username: "Nguyễn Văn Khách",
                email: "khachhang@homestay.vn",
                password: defaultPassword,
                phone: "0987654321",
                image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250",
                role: "user",
                isBlocked: false,
                recentSearchedCities: ["Đà Lạt", "Đà Nẵng"]
            },
            {
                id: "user_guest_02",
                username: "Nguyễn Minh Anh",
                email: "minhanh@gmail.com",
                password: defaultPassword,
                phone: "0923456789",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=250",
                role: "user",
                isBlocked: false,
                recentSearchedCities: ["Sa Pa", "Hà Nội"]
            },
            {
                id: "user_guest_03",
                username: "Phạm Quốc Bảo",
                email: "quocbao@gmail.com",
                password: defaultPassword,
                phone: "0932145678",
                image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=250",
                role: "user",
                isBlocked: false,
                recentSearchedCities: ["Phú Quốc", "Nha Trang"]
            },
            {
                id: "user_guest_04",
                username: "Trần Thu Hương",
                email: "huongtran@gmail.com",
                password: defaultPassword,
                phone: "0943215678",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250",
                role: "user",
                isBlocked: false,
                recentSearchedCities: ["Đà Lạt", "Hội An"]
            },
            {
                id: "user_guest_blocked",
                username: "Tài Khoản Vi Phạm (Spam Demo)",
                email: "spammer@homestay.vn",
                password: defaultPassword,
                phone: "0999999999",
                image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=250",
                role: "user",
                isBlocked: true, // Demo tài khoản bị khóa để Admin test mở khóa
                recentSearchedCities: []
            }
        ];

        const createdUsers = await User.bulkCreate(
            usersData.map((u, idx) => ({
                ...u,
                codeVerify: u.codeVerify || String(100000 + (idx + 1) * 11111).slice(0, 6),
            }))
        );
        console.log(`✅ Insert ${createdUsers.length} users.`);

        // ==========================================
        // 2. SEED CATEGORIES (Danh mục Tiện ích & Khu vực)
        // ==========================================
        const categoriesData = [
            // Cities
            { name: "Đà Lạt", type: "city", description: "Thành phố sương mù mộng mơ, khí hậu mát mẻ quanh năm và ngàn hoa khoe sắc." },
            { name: "Hà Nội", type: "city", description: "Thủ đô nghìn năm văn hiến với 36 phố phường cổ kính và ẩm thực tinh tế." },
            { name: "TP. Hồ Chí Minh", type: "city", description: "Trung tâm kinh tế sôi động, hiện đại và không bao giờ ngủ của Việt Nam." },
            { name: "Đà Nẵng", type: "city", description: "Thành phố đáng sống nhất Việt Nam với bãi biển Mỹ Khê tuyệt đẹp và cầu Rồng." },
            { name: "Nha Trang", type: "city", description: "Thiên đường biển xanh, cát trắng và những khu nghỉ dưỡng ven vịnh cao cấp." },
            { name: "Sa Pa", type: "city", description: "Vùng núi cao Tây Bắc hùng vĩ với đỉnh Fansipan và ruộng bậc thang rực rỡ." },
            { name: "Phú Quốc", type: "city", description: "Hòn đảo ngọc nhiệt đới với những bãi tắm hoang sơ và cảnh hoàng hôn rực rỡ." },
            { name: "Hội An", type: "city", description: "Đô thị cổ bên dòng sông Hoài lung linh ánh đèn lồng rực rỡ mỗi đêm." },
            { name: "Vũng Tàu", type: "city", description: "Điểm đến biển quen thuộc cuối tuần với ngọn hải đăng cổ và gió biển lộng gió." },
            { name: "Ninh Bình", type: "city", description: "Non nước hữu tình với quần thể danh thắng Tràng An và Tam Cốc - Bích Động." },
            { name: "Huế", type: "city", description: "Cố đô trầm mặc, mang đậm dấu ấn lịch sử triều Nguyễn bên dòng sông Hương." },
            { name: "Quy Nhơn", type: "city", description: "Thành phố biển thanh bình với eo Gió, Kỳ Co nước trong vắt màu ngọc bích." },
            { name: "Hạ Long", type: "city", description: "Kỳ quan thiên nhiên thế giới với hàng nghìn hòn đảo đá vôi kỳ vĩ." },
            { name: "Phan Thiết", type: "city", description: "Thủ phủ resort Mũi Né với những đồi cát bay vàng óng và biển xanh nắng ấm." },
            { name: "Cần Thơ", type: "city", description: "Thủ phủ miền Tây sông nước với chợ nổi Cái Răng nhộn nhịp lúc bình minh." },

            // Amenities
            { name: "Free WiFi", type: "amenity", icon: "wifi", description: "Internet cáp quang không dây tốc độ cao phủ sóng toàn homestay" },
            { name: "Free Breakfast", type: "amenity", icon: "breakfast", description: "Bữa sáng dinh dưỡng miễn phí mỗi ngày kèm đồ uống thơm ngon" },
            { name: "Room Service", type: "amenity", icon: "service", description: "Dịch vụ phòng tận tâm, hỗ trợ dọn dẹp và chuẩn bị đồ uống theo yêu cầu" },
            { name: "Mountain View", type: "amenity", icon: "mountain", description: "Tầm nhìn panorama hướng thẳng ra đồi núi hoặc thung lũng mây" },
            { name: "Pool Access", type: "amenity", icon: "pool", description: "Hồ bơi vô cực hoặc bể bơi bốn mùa ngoài trời trong xanh" },
            { name: "Bếp BBQ ngoài trời", type: "amenity", icon: "bbq", description: "Khu vực sân vườn nướng thịt ngoài trời đầy đủ vỉ nướng, bàn ghế tiệc" },
            { name: "Bồn tắm massage", type: "amenity", icon: "bath", description: "Bồn tắm sục ngâm mình thư giãn kèm tinh dầu thảo mộc" },
            { name: "Smart TV 4K", type: "amenity", icon: "tv", description: "Truyền hình thông minh màn hình lớn tích hợp Netflix, YouTube" },
            { name: "Điều hòa 2 chiều", type: "amenity", icon: "ac", description: "Hệ thống làm mát và sưởi ấm hiện đại mang lại nhiệt độ lý tưởng" },
            { name: "Chỗ đậu xe ô tô", type: "amenity", icon: "parking", description: "Bãi đỗ xe riêng rộng rãi, an toàn có camera an ninh 24/7" }
        ];

        const createdCategories = await Category.bulkCreate(categoriesData);
        console.log(`✅ INSERT ${createdCategories.length} danh mục (Tiện ích & Khu vực).`);

        // ==========================================
        // 3. SEED HOTELS / HOMESTAYS
        // ==========================================
        const hotelsData = [
            {
                name: "Mây Lang Thang Homestay & Retreat",
                address: "Hoàng Hoa Thám, Phường 10, TP. Đà Lạt, Lâm Đồng",
                contact: "0905 123 456",
                city: "Đà Lạt",
                description: "Homestay nằm giữa thung lũng thông mộng mơ của Đà Lạt, view ngắm hoàng hôn và mây trôi bồng bềnh tuyệt đẹp. Đầy đủ tiện nghi cao cấp, không gian vintage yên bình và có sân khấu acoustic mỗi cuối tuần.",
                image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000",
                status: "approved",
                ownerId: "user_owner_01"
            },
            {
                name: "Biển Xanh Boutique Villa & Spa",
                address: "Võ Nguyên Giáp, Quận Ngũ Hành Sơn, TP. Đà Nẵng",
                contact: "0908 888 999",
                city: "Đà Nẵng",
                description: "Villa nghỉ dưỡng phong cách Địa Trung Hải sát bờ biển Mỹ Khê, có hồ bơi riêng, sân vườn tổ chức BBQ hải sản và chỉ cách bãi biển 2 phút đi bộ.",
                image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000",
                status: "approved",
                ownerId: "user_owner_02"
            },
            {
                name: "Eco Palm Mountain Retreat Sa Pa",
                address: "Bản Lao Chải, TX. Sa Pa, Lào Cai",
                contact: "0912 345 678",
                city: "Sa Pa",
                description: "Trải nghiệm không gian nghỉ dưỡng nhà sàn gỗ sinh thái nhìn thẳng ra thung lũng Mường Hoa và những thửa ruộng bậc thang hùng vĩ. Không khí trong lành, có bồn tắm lá thuốc Dao đỏ.",
                image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
                status: "approved",
                ownerId: "user_owner_03"
            },
            {
                name: "Sunset Beachside Bungalow",
                address: "Bãi Ông Lang, Cửa Dương, TP. Phú Quốc, Kiên Giang",
                contact: "0934 567 890",
                city: "Phú Quốc",
                description: "Bungalow mộc mạc nép mình dưới rặng dừa xanh mát bên bờ biển Ông Lang yên bình. Tận hưởng trọn vẹn cảnh hoàng hôn đỏ rực tuyệt đẹp trên biển đảo ngọc Phú Quốc.",
                image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000",
                status: "approved",
                ownerId: "user_owner_04"
            },
            {
                name: "Phố Cổ Heritage Homestay",
                address: "Hàng Bè, Phường Hàng Bạc, Quận Hoàn Kiếm, Hà Nội",
                contact: "0945 678 901",
                city: "Hà Nội",
                description: "Căn homestay đậm chất Hà Nội xưa nằm ngay trái tim 36 phố phường, chỉ 3 phút đi bộ ra Hồ Hoàn Kiếm. Thiết kế hoài niệm kết hợp trang thiết bị tiện nghi hiện đại.",
                image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000",
                status: "approved",
                ownerId: "user_owner_05"
            },
            {
                name: "The Green Garden House Thảo Điền",
                address: "Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
                contact: "0978 901 234",
                city: "TP. Hồ Chí Minh",
                description: "Biệt thự xanh ngát ngập tràn hoa lá tại bán đảo Thảo Điền, không gian nghỉ dưỡng tĩnh lặng giữa lòng Sài Gòn sôi động, có bể bơi ngoài trời sang trọng.",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000",
                status: "pending", // Homestay chờ duyệt để Admin kiểm thử tính năng duyệt tin
                ownerId: "user_owner_06"
            }
        ];

        const createdHotels = await Hotel.bulkCreate(hotelsData);
        console.log(`✅ INSERT ${createdHotels.length} Homestay & Khách sạn.`);

        const [hotelDalat, hotelDanang, hotelSapa, hotelPhuQuoc, hotelHanoi, hotelHcm] = createdHotels;

        // ==========================================
        // 4. SEED ROOMS (Phòng nghỉ kèm giá theo mùa)
        // Mức giá từ 100.000 VNĐ đến dưới 1.000.000 VNĐ
        // ==========================================
        const roomsData = [
            // Rooms for Mây Lang Thang Homestay (Đà Lạt)
            {
                hotelId: hotelDalat.id,
                roomType: "Phòng đôi",
                maxGuests: 2,
                pricePerNight: 280000,
                amenities: ["Free WiFi", "Free Breakfast", "Mountain View", "Bếp BBQ ngoài trời"],
                seasonalPricing: [
                    { name: "Mùa Hoa Dã Quỳ", startDate: "2026-10-15", endDate: "2026-11-30", pricePerNight: 350000 },
                    { name: "Lễ Giáng Sinh & Năm Mới", startDate: "2026-12-20", endDate: "2027-01-05", pricePerNight: 420000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelDalat.id,
                roomType: "Phòng cao cấp",
                maxGuests: 3,
                pricePerNight: 450000,
                amenities: ["Free WiFi", "Free Breakfast", "Mountain View", "Bồn tắm massage", "Room Service"],
                seasonalPricing: [
                    { name: "Festival Hoa Đà Lạt", startDate: "2026-12-01", endDate: "2026-12-31", pricePerNight: 580000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
                    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelDalat.id,
                roomType: "Căn hộ gia đình",
                maxGuests: 5,
                pricePerNight: 750000,
                amenities: ["Free WiFi", "Free Breakfast", "Mountain View", "Bếp BBQ ngoài trời", "Chỗ đậu xe ô tô"],
                seasonalPricing: [
                    { name: "Tết Nguyên Đán", startDate: "2027-01-20", endDate: "2027-02-10", pricePerNight: 950000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800"
                ],
                isAvailable: true
            },

            // Rooms for Biển Xanh Villa (Đà Nẵng)
            {
                hotelId: hotelDanang.id,
                roomType: "Phòng đôi",
                maxGuests: 2,
                pricePerNight: 320000,
                amenities: ["Free WiFi", "Pool Access", "Free Breakfast", "Smart TV 4K"],
                seasonalPricing: [
                    { name: "Lễ Hội Pháo Hoa Quốc Tế", startDate: "2026-06-01", endDate: "2026-07-15", pricePerNight: 450000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelDanang.id,
                roomType: "Phòng cao cấp",
                maxGuests: 3,
                pricePerNight: 550000,
                amenities: ["Free WiFi", "Pool Access", "Bồn tắm massage", "Room Service", "Free Breakfast"],
                seasonalPricing: [
                    { name: "Cao Điểm Du Lịch Hè", startDate: "2026-05-15", endDate: "2026-08-31", pricePerNight: 680000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
                    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelDanang.id,
                roomType: "Phòng đơn",
                maxGuests: 1,
                pricePerNight: 190000,
                amenities: ["Free WiFi", "Smart TV 4K", "Điều hòa 2 chiều"],
                seasonalPricing: [],
                images: [
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800"
                ],
                isAvailable: false // Demo phòng tạm khóa
            },

            // Rooms for Eco Palm Mountain Retreat (Sa Pa)
            {
                hotelId: hotelSapa.id,
                roomType: "Phòng đôi",
                maxGuests: 2,
                pricePerNight: 290000,
                amenities: ["Free WiFi", "Mountain View", "Free Breakfast", "Bồn tắm massage"],
                seasonalPricing: [
                    { name: "Mùa Lúa Chín Sa Pa", startDate: "2026-09-01", endDate: "2026-10-10", pricePerNight: 390000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelSapa.id,
                roomType: "Phòng cao cấp",
                maxGuests: 3,
                pricePerNight: 480000,
                amenities: ["Free WiFi", "Mountain View", "Free Breakfast", "Bồn tắm massage", "Điều hòa 2 chiều"],
                seasonalPricing: [
                    { name: "Mùa Săn Mây Mùa Đông", startDate: "2026-11-15", endDate: "2027-01-15", pricePerNight: 590000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800"
                ],
                isAvailable: true
            },

            // Rooms for Sunset Beachside Bungalow (Phú Quốc)
            {
                hotelId: hotelPhuQuoc.id,
                roomType: "Phòng đôi",
                maxGuests: 2,
                pricePerNight: 360000,
                amenities: ["Free WiFi", "Pool Access", "Free Breakfast", "Room Service"],
                seasonalPricing: [
                    { name: "Mùa Nắng Đẹp Phú Quốc", startDate: "2026-11-01", endDate: "2027-04-30", pricePerNight: 460000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelPhuQuoc.id,
                roomType: "Căn hộ gia đình",
                maxGuests: 6,
                pricePerNight: 820000,
                amenities: ["Free WiFi", "Pool Access", "Free Breakfast", "Bếp BBQ ngoài trời", "Smart TV 4K"],
                seasonalPricing: [],
                images: [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800"
                ],
                isAvailable: true
            },

            // Rooms for Phố Cổ Heritage Homestay (Hà Nội)
            {
                hotelId: hotelHanoi.id,
                roomType: "Phòng đơn",
                maxGuests: 1,
                pricePerNight: 160000,
                amenities: ["Free WiFi", "Free Breakfast", "Điều hòa 2 chiều"],
                seasonalPricing: [],
                images: [
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelHanoi.id,
                roomType: "Phòng đôi",
                maxGuests: 2,
                pricePerNight: 270000,
                amenities: ["Free WiFi", "Free Breakfast", "Smart TV 4K", "Điều hòa 2 chiều"],
                seasonalPricing: [
                    { name: "Mùa Thu Hà Nội", startDate: "2026-09-01", endDate: "2026-10-31", pricePerNight: 340000 }
                ],
                images: [
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800",
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800",
                    "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelHanoi.id,
                roomType: "Phòng cao cấp",
                maxGuests: 3,
                pricePerNight: 430000,
                amenities: ["Free WiFi", "Free Breakfast", "Bồn tắm massage", "Room Service"],
                seasonalPricing: [],
                images: [
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800",
                    "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=800"
                ],
                isAvailable: true
            },

            // Rooms for The Green Garden House (TP. Hồ Chí Minh)
            {
                hotelId: hotelHcm.id,
                roomType: "Phòng đôi",
                maxGuests: 2,
                pricePerNight: 310000,
                amenities: ["Free WiFi", "Pool Access", "Free Breakfast", "Smart TV 4K"],
                seasonalPricing: [],
                images: [
                    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800"
                ],
                isAvailable: true
            },
            {
                hotelId: hotelHcm.id,
                roomType: "Phòng cao cấp",
                maxGuests: 3,
                pricePerNight: 520000,
                amenities: ["Free WiFi", "Pool Access", "Bồn tắm massage", "Room Service", "Chỗ đậu xe ô tô"],
                seasonalPricing: [],
                images: [
                    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800"
                ],
                isAvailable: true
            }
        ];

        const createdRooms = await Room.bulkCreate(roomsData);
        console.log(`✅ INSERT ${createdRooms.length} phòng nghỉ.`);

        // ==========================================
        // 5. SEED BOOKINGS (Đơn đặt phòng đa dạng trạng thái)
        // ==========================================
        const today = new Date();
        const formatDate = (daysOffset) => {
            const d = new Date(today);
            d.setDate(d.getDate() + daysOffset);
            return d;
        };

        const bookingsData = [
            // 1. Khách đang ở hiện tại (Active stay) tại Mây Lang Thang
            {
                userId: "user_guest_01",
                roomId: createdRooms[0].id,
                hotelId: hotelDalat.id,
                checkInDate: formatDate(-1),
                checkOutDate: formatDate(2),
                totalPrice: 840000,
                guests: 2,
                status: "confirmed",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 2. Khách sắp tới nhận phòng tuần sau (Upcoming confirmed)
            {
                userId: "user_guest_02",
                roomId: createdRooms[1].id,
                hotelId: hotelDalat.id,
                checkInDate: formatDate(4),
                checkOutDate: formatDate(7),
                totalPrice: 1350000,
                guests: 2,
                status: "confirmed",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 3. Đơn chờ duyệt (Pending booking) - để chủ nhà bấm Duyệt/Từ chối
            {
                userId: "user_guest_03",
                roomId: createdRooms[2].id,
                hotelId: hotelDalat.id,
                checkInDate: formatDate(10),
                checkOutDate: formatDate(13),
                totalPrice: 2250000,
                guests: 4,
                status: "pending",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 4. Lịch sử chuyến đi đã hoàn tất tháng trước (Past stay)
            {
                userId: "user_guest_01",
                roomId: createdRooms[3].id,
                hotelId: hotelDanang.id,
                checkInDate: formatDate(-20),
                checkOutDate: formatDate(-17),
                totalPrice: 960000,
                guests: 2,
                status: "confirmed",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 5. Đơn khách đã hủy (Cancelled booking)
            {
                userId: "user_guest_04",
                roomId: createdRooms[0].id,
                hotelId: hotelDalat.id,
                checkInDate: formatDate(-10),
                checkOutDate: formatDate(-8),
                totalPrice: 560000,
                guests: 1,
                status: "cancelled",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 6. Khách đang ở tại Đà Nẵng
            {
                userId: "user_guest_02",
                roomId: createdRooms[4].id,
                hotelId: hotelDanang.id,
                checkInDate: formatDate(-2),
                checkOutDate: formatDate(1),
                totalPrice: 1650000,
                guests: 2,
                status: "confirmed",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 7. Đơn sắp tới tại Sa Pa
            {
                userId: "user_guest_03",
                roomId: createdRooms[6].id,
                hotelId: hotelSapa.id,
                checkInDate: formatDate(8),
                checkOutDate: formatDate(11),
                totalPrice: 870000,
                guests: 2,
                status: "confirmed",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 8. Đơn chờ duyệt tại Sa Pa
            {
                userId: "user_guest_04",
                roomId: createdRooms[7].id,
                hotelId: hotelSapa.id,
                checkInDate: formatDate(14),
                checkOutDate: formatDate(16),
                totalPrice: 960000,
                guests: 2,
                status: "pending",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 9. Lịch sử đã hoàn tất tại Phú Quốc
            {
                userId: "user_guest_01",
                roomId: createdRooms[8].id,
                hotelId: hotelPhuQuoc.id,
                checkInDate: formatDate(-35),
                checkOutDate: formatDate(-32),
                totalPrice: 1080000,
                guests: 2,
                status: "confirmed",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            },
            // 10. Đơn sắp tới tại Hà Nội
            {
                userId: "user_guest_02",
                roomId: createdRooms[11].id,
                hotelId: hotelHanoi.id,
                checkInDate: formatDate(5),
                checkOutDate: formatDate(7),
                totalPrice: 540000,
                guests: 2,
                status: "confirmed",
                paymentMethod: "Pay At Hotel",
                bookingCode: Math.random().toString(36).substring(2, 10)
            }
        ];

        const createdBookings = await Booking.bulkCreate(
            bookingsData.map((b, idx) => ({
                ...b,
                isSendMail: b.status === "confirmed",
                bookingCode: b.bookingCode || `bk${String(100000 + (idx + 1) * 13579).slice(0, 6)}`,
            }))
        );
        console.log(`✅ INSERT ${createdBookings.length} bookings.`);

        // ==========================================
        // 6. SEED REVIEWS (Đánh giá & phản hồi chất lượng)
        // ==========================================
        const reviewsData = [
            {
                userId: "user_guest_01",
                hotelId: hotelDalat.id,
                roomId: createdRooms[0].id,
                rating: 5,
                comment: "Homestay tuyệt vời hơn cả mong đợi! Không gian yên bình, ngắm mây buổi sáng từ phòng ngủ rất thơ mộng. Chủ nhà cực kỳ chu đáo và mến khách."
            },
            {
                userId: "user_guest_02",
                hotelId: hotelDalat.id,
                roomId: createdRooms[1].id,
                rating: 5,
                comment: "Phòng VIP có bồn tắm massage view rừng thông cực kỳ thư giãn. Đồ ăn sáng tươi ngon chuẩn vị Đà Lạt, sân khấu acoustic cuối tuần rất chill."
            },
            {
                userId: "user_guest_03",
                hotelId: hotelDalat.id,
                roomId: createdRooms[2].id,
                rating: 4,
                comment: "Không gian phòng gia đình rộng rãi, tiện nghi đầy đủ cho nhóm 5 người. Đường vào hơi dốc nhẹ một chút nhưng khung cảnh thiên nhiên hoàn toàn xứng đáng."
            },
            {
                userId: "user_guest_01",
                hotelId: hotelDanang.id,
                roomId: createdRooms[3].id,
                rating: 5,
                comment: "Vị trí sát bờ biển Mỹ Khê cực kỳ thuận tiện, chỉ đi bộ 2 phút là chạm chân đến cát. Hồ bơi riêng sạch sẽ, phòng ốc thơm tho và hiện đại."
            },
            {
                userId: "user_guest_04",
                hotelId: hotelDanang.id,
                roomId: createdRooms[4].id,
                rating: 5,
                comment: "Villa đẳng cấp, các bạn nhân viên phục vụ cực kỳ chuyên nghiệp. Gia đình mình đã có kỳ nghỉ hè đáng nhớ tại Đà Nẵng."
            },
            {
                userId: "user_guest_02",
                hotelId: hotelSapa.id,
                roomId: createdRooms[6].id,
                rating: 5,
                comment: "Cảnh nhìn ra thung lũng Mường Hoa đẹp mê hồn, ngỡ như lạc vào chốn bồng lai tiên cảnh. Trải nghiệm tắm lá thuốc Dao đỏ rất sảng khoái!"
            },
            {
                userId: "user_guest_03",
                hotelId: hotelPhuQuoc.id,
                roomId: createdRooms[8].id,
                rating: 5,
                comment: "Bungalow sát biển đúng nghĩa, chiều ngắm hoàng hôn đỏ rực bên ly cocktail là khoảnh khắc tuyệt vời nhất chuyến đi Phú Quốc."
            },
            {
                userId: "user_guest_01",
                hotelId: hotelHanoi.id,
                roomId: createdRooms[11].id,
                rating: 5,
                comment: "Homestay nằm giữa lòng phố cổ Hàng Bè, đi bộ ra Hồ Gươm chỉ vài bước chân. Không gian cổ kính nhưng đầy đủ máy lạnh và tiện nghi hiện đại."
            },
            {
                userId: "user_guest_04",
                hotelId: hotelHanoi.id,
                roomId: createdRooms[12].id,
                rating: 4,
                comment: "Phòng ốc bài trí tinh tế, sạch bóng. Buổi sáng bước ra phố là tha hồ thưởng thức phở và cà phê trứng truyền thống."
            }
        ];

        const createdReviews = await Review.bulkCreate(reviewsData);
        console.log(`✅ INSERT ${createdReviews.length} reviews`);

        console.log("\n========================================================");
        console.log("🎉 SEED DỮ LIỆU HOÀN TẤT!");
        console.log("========================================================");
        console.log("TỔNG KẾT BẢNG DỮ LIỆU ĐÃ TẠO:");
        console.log(`- Users: ${createdUsers.length} tài khoản`);
        console.log(`- Categories: ${createdCategories.length} danh mục (15 thành phố, 10 tiện ích)`);
        console.log(`- Hotels: ${createdHotels.length} homestay/khách sạn`);
        console.log(`- Rooms: ${createdRooms.length} phòng nghỉ`);
        console.log(`- Bookings: ${createdBookings.length} đơn đặt phòng (đang ở, sắp tới, chờ duyệt, hoàn tất, đã hủy)`);
        console.log(`- Reviews: ${createdReviews.length} đánh giá thực tế`);
        console.log("========================================================");
        console.log("TÀI KHOẢN ĐĂNG NHẬP THỬ NGHIỆM:");
        console.log("1. Quản trị viên (Admin): admin@homestay.vn / password123");
        console.log("2. Chủ nhà (Hotel Owner): chubay@homestay.vn / password123");
        console.log("3. Khách hàng (Customer): khachhang@homestay.vn / password123");
        console.log("========================================================\n");

        return true;
    } catch (error) {
        console.error("❌ Lỗi trong quá trình nạp dữ liệu Seeder:", error);
        throw error;
    }
};

// Cho phép chạy trực tiếp từ dòng lệnh: node backend/database/seeder.js
if (process.argv[1]?.endsWith("seeder.js") || process.argv[1]?.endsWith("seedProductionData.js")) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
