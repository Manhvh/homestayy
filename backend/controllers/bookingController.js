import { Op } from "sequelize";
import { Booking, Hotel, Room, User, Review, sequelize } from "../models/index.js";
import {
    sendBookingCreatedEmail,
    sendBookingConfirmedEmail,
    sendBookingDetailsEmail,
} from "../utils/mailService.js";

// Function to check availability of the room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
            return false;
        }

        const roomDoc = await Room.findByPk(room);
        if (!roomDoc || !roomDoc.isAvailable) {
            return false;
        }

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
        throw new Error("Không thể kiểm tra trạng thái phòng trống.");
    }
};

// API to check availability of room
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to create a new booking
export const createBookings = async (req, res) => {
    const { room, checkInDate, checkOutDate, guests, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!room || !checkInDate || !checkOutDate) {
        return res.status(400).json({ success: false, message: "Vui lòng chọn phòng, ngày nhận phòng và ngày trả phòng." });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        return res.status(400).json({ success: false, message: "Định dạng ngày nhận/trả phòng không hợp lệ." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDay = new Date(checkIn);
    checkInDay.setHours(0, 0, 0, 0);
    const checkOutDay = new Date(checkOut);
    checkOutDay.setHours(0, 0, 0, 0);

    if (checkInDay < today) {
        return res.status(400).json({ success: false, message: "Ngày nhận phòng không được nằm trong quá khứ." });
    }

    if (checkOutDay <= checkInDay) {
        return res.status(400).json({ success: false, message: "Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 đêm." });
    }

    const totalNights = Math.round((checkOutDay - checkInDay) / (1000 * 60 * 60 * 24));
    if (totalNights < 1) {
        return res.status(400).json({ success: false, message: "Thời gian lưu trú tối thiểu là 1 đêm." });
    }

    const guestCount = guests !== undefined && guests !== null ? parseInt(guests, 10) : 1;
    if (isNaN(guestCount) || guestCount < 1) {
        return res.status(400).json({ success: false, message: "Số lượng khách lưu trú tối thiểu là 1 người." });
    }

    const t = await sequelize.transaction();
    try {
        // Lock the room row exclusively to prevent concurrent overbooking (race condition)
        const roomData = await Room.findByPk(room, {
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!roomData) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin phòng." });
        }

        if (!roomData.isAvailable) {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Phòng này hiện đang tạm ngưng phục vụ, không thể đặt." });
        }

        const hotelData = await Hotel.findByPk(roomData.hotelId, { transaction: t });
        if (!hotelData || hotelData.status === "rejected") {
            await t.rollback();
            return res.status(400).json({ success: false, message: "Homestay này hiện không hoạt động." });
        }

        const maxCapacity = roomData.maxGuests || 2;
        if (guestCount > maxCapacity) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Phòng này chỉ phục vụ tối đa ${maxCapacity} khách. Vui lòng giảm số lượng khách hoặc đặt thêm phòng.`
            });
        }

        // Perform a locking read on bookings to check conflicts against latest committed state
        const conflictingBooking = await Booking.findOne({
            where: {
                roomId: roomData.id,
                status: { [Op.ne]: "cancelled" },
                checkInDate: { [Op.lt]: checkOut },
                checkOutDate: { [Op.gt]: checkIn },
            },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (conflictingBooking) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: "Phòng này đã có khách đặt trong khoảng thời gian đã chọn!"
            });
        }

        let totalPrice = 0;
        const cur = new Date(checkIn);
        while (cur < checkOut) {
            let nightlyRate = roomData.pricePerNight;
            if (roomData.seasonalPricing && Array.isArray(roomData.seasonalPricing)) {
                const season = roomData.seasonalPricing.find((s) => {
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

        const bookingCode = Math.random().toString(36).substring(2, 10);

        const booking = await Booking.create({
            userId,
            roomId: roomData.id,
            hotelId: hotelData.id,
            guests: guestCount,
            checkInDate,
            checkOutDate,
            totalPrice,
            status: "pending",
            paymentMethod: paymentMethod || "Pay At Hotel",
            isSendMail: false,
            bookingCode,
        }, { transaction: t });

        await t.commit();

        const mailSent = await sendBookingCreatedEmail({
            user: req.user,
            booking,
            hotel: hotelData,
            totalPrice,
        });
        if (mailSent) {
            booking.isSendMail = true;
            await booking.save();
        }

        res.json({ success: true, message: "Đặt phòng thành công!", booking });
    } catch (error) {
        if (!t.finished) {
            await t.rollback();
        }
        console.error("Create booking error:", error);
        res.status(500).json({ success: false, message: "Không thể tạo đơn đặt phòng: " + error.message });
    }
};

// API to get all bookings for a user
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const [bookings, userReviews] = await Promise.all([
            Booking.findAll({
                where: { userId },
                include: [
                    { model: Room, as: "room" },
                    { model: Hotel, as: "hotel" },
                    { model: Review, as: "review" }
                ],
                order: [["createdAt", "DESC"]]
            }),
            Review.findAll({
                where: { userId },
                order: [["createdAt", "DESC"]]
            })
        ]);

        const bookingsWithReview = bookings.map((b) => {
            const plain = b.toJSON();
            if (!plain.review) {
                const matched = userReviews.find(
                    (r) =>
                        (r.bookingId && Number(r.bookingId) === Number(plain.id)) ||
                        (!r.bookingId && Number(r.hotelId) === Number(plain.hotelId))
                );
                if (matched) {
                    plain.review = matched.toJSON();
                }
            }
            return plain;
        });

        res.json({ success: true, bookings: bookingsWithReview });
    } catch (error) {
        console.error("Get user bookings error:", error);
        res.status(500).json({ success: false, message: "Không thể tải danh sách đơn đặt phòng." });
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
                { model: User, as: "user", attributes: ["id", "username", "email", "phone", "image"] }
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
        res.status(500).json({ success: false, message: "Không thể tải danh sách đơn đặt phòng của homestay." });
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
            include: [
                { model: Hotel, as: "hotel" },
                { model: User, as: "user", attributes: ["id", "username", "email"] }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
        }

        if (booking.hotel.ownerId !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Bạn không có quyền cập nhật đơn đặt phòng này." });
        }

        booking.status = status;
        const codeDisplay = booking.bookingCode || booking.id;
        if (status === "confirmed") {
            await sendBookingConfirmedEmail({
                user: booking.user,
                hotel: booking.hotel,
                codeDisplay,
            });
            booking.isSendMail = true;
        }
        await booking.save();

        res.json({
            success: true,
            message: status === "confirmed" ? "Đã xác nhận duyệt đơn và gửi thông báo tới khách hàng!" : "Đã hủy đơn đặt phòng.",
            booking
        });
    } catch (error) {
        console.error("Update booking status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to send / mark confirmation email as sent to customer
export const sendBookingMail = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id, {
            include: [
                { model: Hotel, as: "hotel" },
                { model: Room, as: "room" },
                { model: User, as: "user", attributes: ["id", "username", "email", "phone"] }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn đặt phòng." });
        }

        if (booking.hotel.ownerId !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Bạn không có quyền thực hiện thao tác này." });
        }

        const codeDisplay = booking.bookingCode || booking.id;
        await sendBookingDetailsEmail({ booking, codeDisplay });

        booking.isSendMail = true;
        await booking.save();

        res.json({
            success: true,
            message: `Đã gửi email xác nhận đơn #${codeDisplay} tới khách hàng!`,
            booking,
        });
    } catch (error) {
        console.error("Send booking mail error:", error);
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
