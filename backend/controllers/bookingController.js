import { Op } from "sequelize";
import transporter from '../configs/nodemailer.js';
import { Booking, Hotel, Room, User, Offer, sequelize } from "../models/index.js";

// Helper to check if an offer expiryDate (YYYY-MM-DD) has passed
const isOfferExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate);
    if (isNaN(exp.getTime())) return false;
    exp.setHours(23, 59, 59, 999);
    return exp < new Date();
};

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

// Predefined valid exclusive offer coupons
export const VALID_COUPONS = {
    SUMMER25: { code: "SUMMER25", percent: 25, maxDiscount: 500000, minNights: 2, expiryDate: "2027-08-31", title: "Gói Nghỉ Dưỡng Mùa Hè" },
    ROMANCE20: { code: "ROMANCE20", percent: 20, maxDiscount: 400000, minNights: 1, expiryDate: "2027-09-20", title: "Kỳ Nghỉ Lãng Mạn Cặp Đôi" },
    EARLYBIRD30: { code: "EARLYBIRD30", percent: 30, maxDiscount: 600000, minNights: 1, minDaysAhead: 14, expiryDate: "2027-09-25", title: "Ưu Đãi Đặt Sớm Homestay" },
    WEEKEND15: { code: "WEEKEND15", percent: 15, maxDiscount: 300000, minNights: 1, expiryDate: "2027-10-31", title: "Cuối Tuần Thảnh Thơi" },
    WELCOME10: { code: "WELCOME10", percent: 10, maxDiscount: 200000, minNights: 1, expiryDate: "2027-12-31", title: "Chào Mừng Khách Hàng Mới" },
    LONGSTAY25: { code: "LONGSTAY25", percent: 25, maxDiscount: 800000, minNights: 4, expiryDate: "2027-11-15", title: "Lưu Trú Dài Ngày Siêu Tiết Kiệm" },
};

// API to validate a coupon code
export const validateCouponAPI = async (req, res) => {
    try {
        const { couponCode, subtotal, nights } = req.body;
        if (!couponCode) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mã ưu đãi!" });
        }
        const cleanCode = couponCode.trim().toUpperCase();

        // 1. Try finding in database Offer table
        let couponData = null;
        const dbOffer = await Offer.findOne({ where: { code: cleanCode, isActive: true } });
        if (dbOffer) {
            couponData = {
                code: dbOffer.code,
                percent: dbOffer.priceOff,
                maxDiscount: dbOffer.maxDiscount,
                minNights: dbOffer.minNights || 1,
                expiryDate: dbOffer.expiryDate,
                title: dbOffer.title,
            };
        } else if (VALID_COUPONS[cleanCode]) {
            couponData = VALID_COUPONS[cleanCode];
        }

        if (!couponData) {
            return res.status(400).json({ success: false, message: "Mã ưu đãi không tồn tại hoặc đã ngừng áp dụng!" });
        }

        if (isOfferExpired(couponData.expiryDate)) {
            return res.status(400).json({ success: false, message: "Mã ưu đãi này đã hết hạn sử dụng!" });
        }

        const requiredNights = Number(couponData.minNights) || 1;
        if (nights !== undefined && nights !== null && Number(nights) < requiredNights) {
            return res.status(400).json({
                success: false,
                message: `Mã ưu đãi ${couponData.code} yêu cầu đặt tối thiểu ${requiredNights} đêm!`
            });
        }

        const price = Number(subtotal) || 0;
        let rawDiscount = (price * couponData.percent) / 100;
        if (couponData.maxDiscount) {
            rawDiscount = Math.min(rawDiscount, couponData.maxDiscount);
        }
        const discountAmount = Math.round(rawDiscount);
        const finalTotal = Math.max(0, price - discountAmount);

        res.json({
            success: true,
            coupon: {
                code: couponData.code,
                title: couponData.title,
                percent: couponData.percent,
                minNights: requiredNights,
                discountAmount,
                finalTotal,
            },
            message: `Áp dụng thành công mã ${couponData.code} (Giảm ${couponData.percent}%)`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to create a new booking
export const createBookings = async (req, res) => {
    const { room, checkInDate, checkOutDate, guests, paymentMethod, couponCode } = req.body;
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

        let discountAmount = 0;
        let appliedCouponCode = null;
        if (couponCode && typeof couponCode === "string" && couponCode.trim() !== "") {
            const cleanCode = couponCode.trim().toUpperCase();
            let couponData = null;
            const dbOffer = await Offer.findOne({ where: { code: cleanCode, isActive: true }, transaction: t });
            if (dbOffer) {
                couponData = {
                    code: dbOffer.code,
                    percent: dbOffer.priceOff,
                    maxDiscount: dbOffer.maxDiscount,
                    minNights: dbOffer.minNights || 1,
                    expiryDate: dbOffer.expiryDate,
                };
            } else if (VALID_COUPONS[cleanCode]) {
                couponData = VALID_COUPONS[cleanCode];
            }

            if (!couponData) {
                await t.rollback();
                return res.status(400).json({ success: false, message: "Mã ưu đãi không tồn tại hoặc đã ngừng áp dụng!" });
            }

            if (isOfferExpired(couponData.expiryDate)) {
                await t.rollback();
                return res.status(400).json({ success: false, message: "Mã ưu đãi này đã hết hạn sử dụng!" });
            }

            const requiredNights = Number(couponData.minNights) || 1;
            if (totalNights < requiredNights) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Mã ưu đãi ${couponData.code} yêu cầu đặt tối thiểu ${requiredNights} đêm!`
                });
            }

            let rawDiscount = (totalPrice * couponData.percent) / 100;
            if (couponData.maxDiscount) {
                rawDiscount = Math.min(rawDiscount, couponData.maxDiscount);
            }
            discountAmount = Math.round(rawDiscount);
            appliedCouponCode = couponData.code;
            totalPrice = Math.max(0, totalPrice - discountAmount);
        }

        let bookingCode = Math.random().toString(36).substring(2, 10);

        const booking = await Booking.create({
            userId,
            roomId: roomData.id,
            hotelId: hotelData.id,
            guests: guestCount,
            checkInDate,
            checkOutDate,
            totalPrice,
            couponCode: appliedCouponCode,
            discountAmount,
            status: "pending",
            paymentMethod: paymentMethod || "Pay At Hotel",
            isSendMail: false,
            bookingCode: bookingCode
        }, { transaction: t });

        await t.commit();

        // Email confirmation
        try {
            if (process.env.SENDER_EMAIL && process.env.SMTP_USER && req.user.email) {
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: req.user.email,
                    subject: 'HomeStay - Xác nhận đặt phòng thành công',
                    html: `
                        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; color: #333;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px;">
                        <h2 style="color: #2c3e50;">Đặt phòng HomeStay thành công!</h2>
                        <p>Xin chào <strong>${req.user.username}</strong>,</p>
                        <p>Đơn đặt phòng của bạn đã được ghi nhận thành công với thông tin chi tiết:</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                            <tr><td style="padding: 6px 0;"><strong>Mã đặt phòng:</strong></td><td>#${booking.bookingCode}</td></tr>
                            <tr><td style="padding: 6px 0;"><strong>Homestay:</strong></td><td>${hotelData.name}</td></tr>
                            <tr><td style="padding: 6px 0;"><strong>Địa chỉ:</strong></td><td>${hotelData.address}</td></tr>
                            <tr><td style="padding: 6px 0;"><strong>Nhận phòng:</strong></td><td>${new Date(booking.checkInDate).toLocaleDateString()}</td></tr>
                            <tr><td style="padding: 6px 0;"><strong>Trả phòng:</strong></td><td>${new Date(booking.checkOutDate).toLocaleDateString()}</td></tr>
                            <tr><td style="padding: 6px 0;"><strong>Tổng tiền:</strong></td><td>${Number(totalPrice).toLocaleString('vi-VN')} ${process.env.CURRENCY || 'VNĐ'}</td></tr>
                            <tr><td style="padding: 6px 0;"><strong>Thanh toán:</strong></td><td>Trực tiếp tại Homestay khi nhận phòng</td></tr>
                        </table>
                        <p style="margin-top: 20px;">Chúc bạn có một kỳ nghỉ thật tuyệt vời!</p>
                        </div>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                booking.isSendMail = true;
                await booking.save();
            }
        } catch (mailError) {
            console.warn("Mail sending skipped:", mailError.message);
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
            try {
                if (process.env.SENDER_EMAIL && process.env.SMTP_USER && booking.user?.email) {
                    await transporter.sendMail({
                        from: process.env.SENDER_EMAIL,
                        to: booking.user.email,
                        subject: `HomeStay - Đơn đặt phòng #${codeDisplay} đã được xác nhận`,
                        html: `<p>Xin chào <strong>${booking.user.username}</strong>, đơn đặt phòng #${codeDisplay} tại <strong>${booking.hotel.name}</strong> của bạn đã được xác nhận!</p>`,
                    });
                }
            } catch (mailErr) {
                console.warn("Confirm booking mail skipped:", mailErr.message);
            }
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

        if (process.env.SENDER_EMAIL && process.env.SMTP_USER && booking.user?.email) {
            try {
                await transporter.sendMail({
                    from: process.env.SENDER_EMAIL,
                    to: booking.user.email,
                    subject: `HomeStay - Thông tin đơn đặt phòng #${codeDisplay}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
                            <h2 style="color: #1d4ed8;">Xác nhận thông tin đặt phòng #${codeDisplay}</h2>
                            <p>Xin chào <strong>${booking.user.username}</strong>,</p>
                            <p>Thông tin đơn đặt phòng của bạn tại <strong>${booking.hotel.name}</strong>:</p>
                            <ul>
                                <li>Mã đặt phòng: <strong>#${codeDisplay}</strong></li>
                                <li>Phòng: ${booking.room?.roomType || "Phòng tiêu chuẩn"}</li>
                                <li>Nhận phòng: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
                                <li>Trả phòng: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>
                                <li>Tổng tiền: ${Number(booking.totalPrice).toLocaleString('vi-VN')} ${process.env.CURRENCY || 'VNĐ'}</li>
                            </ul>
                        </div>
                    `,
                });
            } catch (mailErr) {
                console.warn("Send booking mail skipped:", mailErr.message);
            }
        }

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
