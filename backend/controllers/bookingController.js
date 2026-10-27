import { Op } from "sequelize";
import transporter from '../configs/nodemailer.js';
import { Booking, Hotel, Room, User } from "../models/index.js";

// Function to check availability of the room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);

        const count = await Booking.count({
            where: {
                roomId: room,
                status: { [Op.ne]: "cancelled" },
                checkInDate: { [Op.lt]: end },
                checkOutDate: { [Op.gt]: start },
            }
        });

        return count === 0;

    } catch (error) {
        console.error("Availability check failed:", error.message);
        throw new Error("Failed to check availability");
    }
};

// API to check availability of room
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });

        res.json({ success: true, isAvailable });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to create a new booking
export const createBookings = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, paymentMethod } = req.body;
        const userId = req.user.id;

        const isAvailable = await checkAvailability({
            checkInDate, checkOutDate, room
        });

        if (!isAvailable) {
            return res.json({ success: false, message: "Phòng này đã có khách đặt trong khoảng thời gian đã chọn!" });
        }

        const roomData = await Room.findByPk(room, {
            include: [{ model: Hotel, as: "hotel" }]
        });

        if (!roomData) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin phòng." });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        let totalPrice = 0;
        let cur = new Date(checkIn);
        while (cur < checkOut) {
            let nightlyRate = roomData.pricePerNight;
            if (roomData.seasonalPricing && Array.isArray(roomData.seasonalPricing)) {
                const season = roomData.seasonalPricing.find(s => {
                    const sStart = new Date(s.startDate);
                    const sEnd = new Date(s.endDate);
                    return cur >= sStart && cur <= sEnd;
                });
                if (season) {
                    nightlyRate = season.pricePerNight;
                }
            }
            totalPrice += nightlyRate;
            cur.setDate(cur.getDate() + 1);
        }

        const booking = await Booking.create({
            userId,
            roomId: roomData.id,
            hotelId: roomData.hotel.id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
            status: "pending",
            paymentMethod: paymentMethod || "Pay At Hotel",
        });

        // Email confirmation
        try {
            if (process.env.SENDER_EMAIL && req.user.email) {
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: req.user.email,
                    subject: 'HomeStay - Xác nhận đặt phòng thành công',
                    html: `
                        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px;">
                        <h2 style="color: #2c3e50;">🌟 Đặt phòng HomeStay thành công!</h2>
                        <p>Xin chào <strong>${req.user.username}</strong>,</p>
                        <p>Đơn đặt phòng của bạn đã được ghi nhận thành công với thông tin chi tiết:</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                            <tr><td style="padding: 6px 0;">📌 <strong>Mã đặt phòng:</strong></td><td>#${booking.id}</td></tr>
                            <tr><td style="padding: 6px 0;">🏨 <strong>Homestay:</strong></td><td>${roomData.hotel.name}</td></tr>
                            <tr><td style="padding: 6px 0;">📍 <strong>Địa chỉ:</strong></td><td>${roomData.hotel.address}</td></tr>
                            <tr><td style="padding: 6px 0;">📅 <strong>Nhận phòng:</strong></td><td>${new Date(booking.checkInDate).toLocaleDateString()}</td></tr>
                            <tr><td style="padding: 6px 0;">📅 <strong>Trả phòng:</strong></td><td>${new Date(booking.checkOutDate).toLocaleDateString()}</td></tr>
                            <tr><td style="padding: 6px 0;">💳 <strong>Tổng tiền:</strong></td><td>${totalPrice} USD</td></tr>
                            <tr><td style="padding: 6px 0;">💵 <strong>Thanh toán:</strong></td><td>Trực tiếp tại Homestay khi nhận phòng</td></tr>
                        </table>
                        <p style="margin-top: 20px;">Chúc bạn có một kỳ nghỉ thật tuyệt vời!</p>
                        </div>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
            }
        } catch (mailError) {
            console.warn("Mail sending skipped:", mailError.message);
        }

        res.json({ success: true, message: "Đặt phòng thành công!", booking });

    } catch (error) {
        console.error("Create booking error:", error);
        res.status(500).json({ success: false, message: "Không thể tạo đơn đặt phòng: " + error.message });
    }
};

// API to get all bookings for a user
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.findAll({
            where: { userId },
            include: [
                { model: Room, as: "room" },
                { model: Hotel, as: "hotel" }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.json({ success: true, bookings });

    } catch (error) {
        console.error("Get user bookings error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch bookings!" });
    }
};

// API for Partner / Owner to get all bookings of their homestay
export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });

        if (!hotel) {
            return res.json({ success: true, dashboardData: { totalBookings: 0, totalRevenue: 0, bookings: [] } });
        }

        const bookings = await Booking.findAll({
            where: { hotelId: hotel.id },
            include: [
                { model: Room, as: "room" },
                { model: Hotel, as: "hotel" },
                { model: User, as: "user", attributes: ["id", "username", "email", "image"] }
            ],
            order: [["createdAt", "DESC"]]
        });

        const totalBookings = bookings.length;
        const totalRevenue = bookings
            .filter(b => b.status !== "cancelled")
            .reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });

    } catch (error) {
        console.error("Get hotel bookings error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch bookings!" });
    }
};

// API to approve / cancel booking status
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "confirmed", "cancelled"].includes(status)) {
            return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
        }

        const booking = await Booking.findByPk(id, {
            include: [{ model: Hotel, as: "hotel" }]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
        }

        if (booking.hotel.ownerId !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Bạn không có quyền cập nhật đơn đặt phòng này." });
        }

        booking.status = status;
        await booking.save();

        res.json({
            success: true,
            message: status === "confirmed" ? "Đã xác nhận duyệt đơn đặt phòng!" : "Đã hủy đơn đặt phòng.",
            booking
        });
    } catch (error) {
        console.error("Update booking status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for Customer to cancel their own booking
export const cancelUserBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findOne({ where: { id, userId: req.user.id } });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Đơn này đã được hủy trước đó." });
        }

        booking.status = "cancelled";
        await booking.save();

        res.json({ success: true, message: "Đã hủy đơn đặt phòng thành công!" });
    } catch (error) {
        console.error("Cancel user booking error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
