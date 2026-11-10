import { fn, col } from "sequelize";
import { User, Hotel, Room, Booking, Review } from "../models/index.js";

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const [users, bookingCounts, hotels] = await Promise.all([
            User.findAll({ order: [["createdAt", "DESC"]] }),
            Booking.findAll({
                attributes: ["userId", [fn("COUNT", col("id")), "count"]],
                group: ["userId"],
                raw: true,
            }),
            Hotel.findAll({
                attributes: ["id", "name", "city", "status", "ownerId"],
                raw: true,
            }),
        ]);

        const bookingCountMap = new Map(
            bookingCounts.map((row) => [row.userId, Number(row.count) || 0])
        );
        const hotelByOwnerMap = new Map(
            hotels.map((h) => [
                h.ownerId,
                { id: h.id, name: h.name, city: h.city, status: h.status },
            ])
        );

        const usersWithDetails = users.map((u) => ({
            ...u.toJSON(),
            bookingCount: bookingCountMap.get(u.id) || 0,
            hotel: hotelByOwnerMap.get(u.id) || null,
        }));

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
        const [hotels, roomCounts, bookingCounts] = await Promise.all([
            Hotel.findAll({
                include: [{ model: User, as: "owner", attributes: ["id", "username", "email", "image"] }],
                order: [["createdAt", "DESC"]],
            }),
            Room.findAll({
                attributes: ["hotelId", [fn("COUNT", col("id")), "count"]],
                group: ["hotelId"],
                raw: true,
            }),
            Booking.findAll({
                attributes: ["hotelId", [fn("COUNT", col("id")), "count"]],
                group: ["hotelId"],
                raw: true,
            }),
        ]);

        const roomCountMap = new Map(
            roomCounts.map((row) => [row.hotelId, Number(row.count) || 0])
        );
        const bookingCountMap = new Map(
            bookingCounts.map((row) => [row.hotelId, Number(row.count) || 0])
        );

        const hotelsWithRooms = hotels.map((h) => ({
            ...h.toJSON(),
            roomCount: roomCountMap.get(h.id) || 0,
            bookingCount: bookingCountMap.get(h.id) || 0,
        }));

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
        const [
            totalUsers,
            totalOwners,
            totalHotels,
            pendingHotels,
            approvedHotels,
            bookings,
            reviews,
            recentBookings,
            recentReviews,
        ] = await Promise.all([
            User.count(),
            User.count({ where: { role: "hotelOwner" } }),
            Hotel.count(),
            Hotel.count({ where: { status: "pending" } }),
            Hotel.count({ where: { status: "approved" } }),
            Booking.findAll({ attributes: ["id", "totalPrice", "status"] }),
            Review.findAll({ attributes: ["id", "rating"] }),
            Booking.findAll({
                include: [
                    { model: Hotel, as: "hotel", attributes: ["id", "name", "city"] },
                    { model: User, as: "user", attributes: ["id", "username", "email"] }
                ],
                order: [["createdAt", "DESC"]],
                limit: 5,
            }),
            Review.findAll({
                include: [
                    { model: Hotel, as: "hotel", attributes: ["id", "name"] },
                    { model: User, as: "user", attributes: ["id", "username", "image"] }
                ],
                order: [["createdAt", "DESC"]],
                limit: 5,
            }),
        ]);

        const totalBookings = bookings.length;
        const totalRevenue = bookings
            .filter((b) => b.status !== "cancelled")
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
            : 0;

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
                averageRating,
                recentBookings,
                recentReviews,
            }
        });
    } catch (error) {
        console.error("Get admin stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
