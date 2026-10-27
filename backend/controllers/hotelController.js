import { Hotel, User } from "../models/index.js";

export const registerHotel = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const { name, address, contact, city, description } = req.body;
        const ownerId = req.user.id;

        if (!name || !address || !contact || !city) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingHotel = await Hotel.findOne({ where: { ownerId } });

        if (existingHotel) {
            return res.json({ success: false, message: "Hotel Already Registered" });
        }

        const hotel = await Hotel.create({
            name,
            address,
            contact,
            city,
            description: description || "",
            ownerId,
            status: "approved",
        });

        await User.update({ role: "hotelOwner" }, { where: { id: ownerId } });

        res.json({ success: true, message: "Hotel Registered Successfully", hotel });

    } catch (error) {
        console.error("Hotel registration error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/hotels/my-hotel
export const getMyHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });
        if (!hotel) {
            return res.json({ success: false, message: "Chưa đăng ký homestay nào." });
        }
        res.json({ success: true, hotel });
    } catch (error) {
        console.error("Get my hotel error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/hotels/my-hotel
export const updateMyHotel = async (req, res) => {
    try {
        const { name, address, contact, city, description, image } = req.body;
        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Không tìm thấy homestay của bạn." });
        }

        if (name) hotel.name = name;
        if (address) hotel.address = address;
        if (contact) hotel.contact = contact;
        if (city) hotel.city = city;
        if (description !== undefined) hotel.description = description;
        if (image !== undefined) hotel.image = image;

        await hotel.save();

        res.json({ success: true, message: "Cập nhật thông tin homestay thành công!", hotel });
    } catch (error) {
        console.error("Update my hotel error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
