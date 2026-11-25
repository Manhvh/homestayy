import { Op } from "sequelize";
import { Hotel, Room, Booking, User, Review } from "../models/index.js";
import { uploadMultipleImages, deleteCloudinaryImage } from "../middleware/uploadMiddleware.js";
import { expireStaleVnpayBookings } from "./bookingController.js";
import { parseLocalDateOnly } from "../utils/statsUtils.js";
import { validateSeasonalPricing, calculateBookingPrice } from "../utils/pricingUtils.js";

const parseJsonList = (value, fallback = []) => {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : fallback;
        } catch {
            return value.split(",").map((s) => s.trim()).filter(Boolean);
        }
    }
    return fallback;
};

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities, seasonalPricing, maxGuests } = req.body;

        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Không tìm thấy homestay của bạn!" });
        }

        const seasonValidation = validateSeasonalPricing(seasonalPricing);
        if (!seasonValidation.valid) {
            return res.status(400).json({ success: false, message: seasonValidation.message });
        }

        const images = Array.isArray(req.files) && req.files.length > 0
            ? await uploadMultipleImages(req, req.files, "homestay/rooms")
            : [];

        const room = await Room.create({
            hotelId: hotel.id,
            roomType,
            pricePerNight: +pricePerNight,
            maxGuests: maxGuests ? Math.max(1, parseInt(maxGuests, 10)) : 2,
            amenities: parseJsonList(amenities),
            seasonalPricing: seasonValidation.items,
            images,
            isAvailable: true,
        });

        res.json({ success: true, message: "Tạo phòng thành công!", room });
    } catch (error) {
        console.error("Create room error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get All Rooms with optional date and guests filter
export const getRooms = async (req, res) => {
    try {
        const { checkIn, checkOut, destination, guests } = req.query;

        const whereClause = { isAvailable: true };

        // Filter by capacity (max guests room can accommodate)
        if (guests && !isNaN(Number(guests)) && Number(guests) > 0) {
            whereClause.maxGuests = { [Op.gte]: Number(guests) };
        }

        // Exclude rooms that are already booked (auto-expiring stale unpaid VNPay bookings first)
        await expireStaleVnpayBookings();
        let validDateRange = null;
        if (checkIn && checkOut) {
            const start = parseLocalDateOnly(checkIn);
            const end = parseLocalDateOnly(checkOut);

            if (start && end && start < end) {
                validDateRange = { start, end };
                const conflictingBookings = await Booking.findAll({
                    where: {
                        status: { [Op.ne]: "cancelled" },
                        checkInDate: { [Op.lt]: end },
                        checkOutDate: { [Op.gt]: start },
                    },
                    attributes: ["roomId"],
                });

                const bookedRoomIds = conflictingBookings.map((b) => b.roomId);
                if (bookedRoomIds.length > 0) {
                    whereClause.id = { [Op.notIn]: bookedRoomIds };
                }
            }
        }

        let rooms = await Room.findAll({
            where: whereClause,
            include: [
                {
                    model: Hotel,
                    as: "hotel",
                    where: {
                        status: "approved"
                    },
                    include: [
                        {
                            model: User,
                            as: "owner",
                            attributes: ["id", "username", "email", "image"],
                        }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]],
        });

        // Filter destination if requested
        if (destination) {
            const dest = destination.toLowerCase();
            rooms = rooms.filter((r) =>
                (r.hotel?.city && r.hotel.city.toLowerCase().includes(dest)) ||
                (r.hotel?.address && r.hotel.address.toLowerCase().includes(dest)) ||
                (r.hotel?.name && r.hotel.name.toLowerCase().includes(dest))
            );
        }

        // Attach real averageRating & reviewCount from Reviews table
        const hotelIds = [...new Set(rooms.map((r) => r.hotelId).filter(Boolean))];
        const reviewsByHotel = {};
        if (hotelIds.length > 0) {
            const allReviews = await Review.findAll({
                where: { hotelId: { [Op.in]: hotelIds } },
                attributes: ["hotelId", "roomId", "rating"],
            });
            for (const rev of allReviews) {
                const hId = rev.hotelId;
                if (!reviewsByHotel[hId]) {
                    reviewsByHotel[hId] = [];
                }
                reviewsByHotel[hId].push(Number(rev.rating) || 5);
            }
        }

        const roomsWithRatings = rooms.map((r) => {
            const plain = r.toJSON();
            const ratings = reviewsByHotel[plain.hotelId] || [];
            const reviewCount = ratings.length;
            const averageRating = reviewCount > 0
                ? Number((ratings.reduce((sum, val) => sum + val, 0) / reviewCount).toFixed(1))
                : 0;
            plain.reviewCount = reviewCount;
            plain.averageRating = averageRating;

            if (validDateRange) {
                const priced = calculateBookingPrice(plain, validDateRange.start, validDateRange.end);
                plain.effectivePricePerNight = priced.averagePricePerNight;
                plain.stayTotalPrice = priced.totalPrice;
                plain.stayNights = priced.nights;
            } else {
                plain.effectivePricePerNight = Number(plain.pricePerNight) || 0;
            }
            return plain;
        });

        res.json({ success: true, rooms: roomsWithRatings });
    } catch (error) {
        console.error("Get rooms error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get All Rooms for a specific hotel owner
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ where: { ownerId: req.user.id } });
        if (!hotelData) {
            return res.json({ success: true, hotel: null, rooms: [] });
        }

        const rooms = await Room.findAll({
            where: { hotelId: hotelData.id },
            include: [{ model: Hotel, as: "hotel" }],
            order: [["createdAt", "DESC"]],
        });

        res.json({ success: true, hotel: hotelData, rooms });
    } catch (error) {
        console.error("Get owner rooms error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to update room details
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomType, pricePerNight, amenities, seasonalPricing, maxGuests, isAvailable } = req.body;

        const hotelData = await Hotel.findOne({ where: { ownerId: req.user.id } });
        if (!hotelData) {
            return res.status(403).json({ success: false, message: "Không có quyền thực hiện." });
        }

        const room = await Room.findOne({ where: { id, hotelId: hotelData.id } });
        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng." });
        }

        if (roomType) room.roomType = roomType;
        if (pricePerNight !== undefined) room.pricePerNight = +pricePerNight;
        if (maxGuests !== undefined) room.maxGuests = Math.max(1, parseInt(maxGuests, 10));
        if (isAvailable !== undefined) room.isAvailable = isAvailable === true || isAvailable === 'true';
        if (amenities !== undefined) room.amenities = parseJsonList(amenities);
        if (seasonalPricing !== undefined) {
            const seasonValidation = validateSeasonalPricing(seasonalPricing);
            if (!seasonValidation.valid) {
                return res.status(400).json({ success: false, message: seasonValidation.message });
            }
            room.seasonalPricing = seasonValidation.items;
        }

        const previousImages = Array.isArray(room.images) ? [...room.images] : [];
        let replacedImages = false;
        if (req.files && req.files.length > 0) {
            room.images = await uploadMultipleImages(req, req.files, "homestay/rooms");
            replacedImages = true;
        }

        await room.save();

        if (replacedImages && previousImages.length > 0) {
            Promise.all(previousImages.map((url) => deleteCloudinaryImage(url)));
        }

        res.json({ success: true, message: "Cập nhật thông tin phòng thành công!", room });
    } catch (error) {
        console.error("Update room error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to toggle availability of the room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;
        const hotelData = await Hotel.findOne({ where: { ownerId: req.user.id } });
        if (!hotelData && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Không có quyền thực hiện." });
        }

        const roomData = await Room.findByPk(roomId);
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng." });
        }

        if (req.user.role !== "admin" && roomData.hotelId !== hotelData.id) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền thay đổi trạng thái phòng của homestay khác." });
        }

        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();

        res.json({ success: true, message: "Đã cập nhật trạng thái hoạt động của phòng", isAvailable: roomData.isAvailable });
    } catch (error) {
        console.error("Toggle availability error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to delete a room
export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });

        if (!hotel) {
            return res.status(403).json({ success: false, message: "Không có quyền xóa phòng." });
        }

        const room = await Room.findOne({ where: { id, hotelId: hotel.id } });
        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng cần xóa." });
        }

        const oldImages = Array.isArray(room.images) ? [...room.images] : [];
        await room.destroy();

        if (oldImages.length > 0) {
            Promise.all(oldImages.map((url) => deleteCloudinaryImage(url)));
        }

        res.json({ success: true, message: "Đã xóa phòng thành công!" });
    } catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get a single room by ID
export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id, {
            include: [
                {
                    model: Hotel,
                    as: "hotel",
                    include: [
                        {
                            model: User,
                            as: "owner",
                            attributes: ["id", "username", "email", "image"],
                        }
                    ]
                }
            ]
        });

        if (!room || !room.hotel) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin phòng nghỉ." });
        }

        // Only allow viewing pending/rejected homestay rooms for the homestay owner or Admin
        if (room.hotel.status !== "approved") {
            const isOwner = req.user && String(req.user.id) === String(room.hotel.ownerId);
            const isAdmin = req.user && req.user.role === "admin";
            if (!isOwner && !isAdmin) {
                return res.status(404).json({
                    success: false,
                    message: "Phòng nghỉ không tồn tại hoặc Homestay chưa được phê duyệt công khai.",
                });
            }
        }

        // Attach authentic review stats & host reply rate
        const hotelReviews = await Review.findAll({
            where: { hotelId: room.hotelId },
            attributes: ["rating", "ownerReply"],
        });
        const reviewCount = hotelReviews.length;
        const averageRating = reviewCount > 0
            ? Number((hotelReviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviewCount).toFixed(1))
            : 0;
        const repliedCount = hotelReviews.filter((r) => Boolean(r.ownerReply)).length;
        const ownerReplyRate = reviewCount > 0 ? Math.round((repliedCount / reviewCount) * 100) : null;

        const roomPayload = {
            ...room.toJSON(),
            reviewCount,
            averageRating,
            ownerReplyRate,
        };

        res.json({ success: true, room: roomPayload });
    } catch (error) {
        console.error("Get room by id error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
