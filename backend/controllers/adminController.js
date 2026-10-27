import { User, Hotel, Room, Booking, Review } from "../models/index.js";

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ order: [["createdAt", "DESC"]] });

        const usersWithDetails = await Promise.all(
            users.map(async (u) => {
                const bookingCount = await Booking.count({ where: { userId: u.id } });
                const hotel = await Hotel.findOne({
                    where: { ownerId: u.id },
                    attributes: ["id", "name", "city", "status"]
                });
                return {
                    ...u.toJSON(),
                    bookingCount,
                    hotel: hotel ? hotel.toJSON() : null,
                };
            })
        );

        res.json({ success: true, users: usersWithDetails });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["user", "hotelOwner", "admin"].includes(role)) {
            return res.status(400).json({ success: false, message: "Vai trò không hợp lệ." });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        user.role = role;
        await user.save();

        res.json({ success: true, message: `Đã cập nhật vai trò thành công: ${role}`, user });
    } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/users/:id/status (toggle block/unblock)
export const toggleUserBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            success: true,
            message: user.isBlocked ? "Đã khóa tài khoản người dùng." : "Đã mở khóa tài khoản người dùng.",
            isBlocked: user.isBlocked,
        });
    } catch (error) {
        console.error("Toggle user block error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/hotels
export const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.findAll({
            include: [{ model: User, as: "owner", attributes: ["id", "username", "email", "image"] }],
            order: [["createdAt", "DESC"]]
        });

        const hotelsWithRooms = await Promise.all(
            hotels.map(async (h) => {
                const roomCount = await Room.count({ where: { hotelId: h.id } });
                const bookingCount = await Booking.count({ where: { hotelId: h.id } });
                return {
                    ...h.toJSON(),
                    roomCount,
                    bookingCount,
                };
            })
        );

        res.json({ success: true, hotels: hotelsWithRooms });
    } catch (error) {
        console.error("Get all hotels error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/hotels/:id/status
export const updateHotelStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
        }

        const hotel = await Hotel.findByPk(id);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Không tìm thấy homestay." });
        }

        hotel.status = status;
        await hotel.save();

        res.json({ success: true, message: `Đã cập nhật trạng thái homestay thành: ${status}`, hotel });
    } catch (error) {
        console.error("Update hotel status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalOwners = await User.count({ where: { role: "hotelOwner" } });
        const totalHotels = await Hotel.count();
        const pendingHotels = await Hotel.count({ where: { status: "pending" } });
        const approvedHotels = await Hotel.count({ where: { status: "approved" } });

        const bookings = await Booking.findAll();
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        const reviews = await Review.findAll();
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        const recentBookings = await Booking.findAll({
            include: [
                { model: Hotel, as: "hotel", attributes: ["id", "name", "city"] },
                { model: User, as: "user", attributes: ["id", "username", "email"] }
            ],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });

        const recentReviews = await Review.findAll({
            include: [
                { model: Hotel, as: "hotel", attributes: ["id", "name"] },
                { model: User, as: "user", attributes: ["id", "username", "image"] }
            ],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalOwners,
                totalHotels,
                pendingHotels,
                approvedHotels,
                totalBookings,
                totalRevenue,
                totalReviews,
                averageRating: Number(averageRating),
                recentBookings,
                recentReviews,
            }
        });
    } catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
