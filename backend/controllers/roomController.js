import { Op } from "sequelize";
import { Hotel, Room, Booking, User } from "../models/index.js";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities, seasonalPricing } = req.body;

        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });

        if (!hotel) return res.status(404).json({ success: false, message: "Không tìm thấy homestay của bạn!" });

        // Save local uploads if files exist
        let images = [];
        if (req.files && req.files.length > 0) {
            const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
            images = req.files.map(file => `${backendUrl}/uploads/${file.filename}`);
        }

        // Parse seasonal pricing if provided
        let parsedSeasonal = [];
        if (seasonalPricing) {
            try {
                parsedSeasonal = typeof seasonalPricing === "string" ? JSON.parse(seasonalPricing) : seasonalPricing;
            } catch (e) {
                parsedSeasonal = [];
            }
        }

        const room = await Room.create({
            hotelId: hotel.id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: typeof amenities === "string" ? JSON.parse(amenities) : amenities,
            seasonalPricing: parsedSeasonal,
            images,
            isAvailable: true,
        });

        res.json({ success: true, message: "Tạo phòng thành công!", room });

    } catch (error) {
        console.error("Create room error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get All Rooms with optional date filter (checkIn, checkOut)
export const getRooms = async (req, res) => {
    try {
        const { checkIn, checkOut, destination } = req.query;

        let whereClause = { isAvailable: true };

        // Exclude rooms that are already booked
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end) {
                const conflictingBookings = await Booking.findAll({
                    where: {
                        status: { [Op.ne]: "cancelled" },
                        checkInDate: { [Op.lt]: end },
                        checkOutDate: { [Op.gt]: start },
                    },
                    attributes: ["roomId"],
                });

                const bookedRoomIds = conflictingBookings.map(b => b.roomId);
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
                        status: { [Op.ne]: "rejected" }
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
            rooms = rooms.filter(r =>
                (r.hotel?.city && r.hotel.city.toLowerCase().includes(dest)) ||
                (r.hotel?.address && r.hotel.address.toLowerCase().includes(dest)) ||
                (r.hotel?.name && r.hotel.name.toLowerCase().includes(dest))
            );
        }

        res.json({ success: true, rooms });

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
            return res.json({ success: true, rooms: [] });
        }

        const rooms = await Room.findAll({
            where: { hotelId: hotelData.id },
            include: [{ model: Hotel, as: "hotel" }],
            order: [["createdAt", "DESC"]],
        });

        res.json({ success: true, rooms });

    } catch (error) {
        console.error("Get owner rooms error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to update room details
export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomType, pricePerNight, amenities, seasonalPricing } = req.body;

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
        if (amenities) {
            room.amenities = typeof amenities === "string" ? JSON.parse(amenities) : amenities;
        }
        if (seasonalPricing !== undefined) {
            room.seasonalPricing = typeof seasonalPricing === "string" ? JSON.parse(seasonalPricing) : seasonalPricing;
        }

        await room.save();

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
        const roomData = await Room.findByPk(roomId);

        if (!roomData) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng." });
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

        const count = await Room.destroy({ where: { id, hotelId: hotel.id } });
        if (!count) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng cần xóa." });
        }

        res.json({ success: true, message: "Đã xóa phòng thành công!" });
    } catch (error) {
        console.error("Delete room error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
