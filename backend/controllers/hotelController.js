import { Hotel, User } from "../models/index.js";
import { getUploadedFileUrl } from "../middleware/uploadMiddleware.js";

export const registerHotel = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để đăng ký homestay." });
        }

        const { name, address, contact, city, description, image } = req.body;
        const ownerId = req.user.id;

        if (!name || !address || !contact || !city) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
        }

        const existingHotel = await Hotel.findOne({ where: { ownerId } });

        if (existingHotel) {
            return res.status(400).json({ success: false, message: "Tài khoản này đã đăng ký homestay rồi." });
        }

        const imageUrl = req.file
            ? getUploadedFileUrl(req, req.file.filename)
            : image
            ? String(image).trim()
            : "";

        const hotel = await Hotel.create({
            name: name.trim(),
            address: address.trim(),
            contact: contact.trim(),
            city: city.trim(),
            description: description ? description.trim() : "",
            image: imageUrl,
            ownerId,
            status: "pending",
        });

        if (req.user.role !== "admin") {
            await User.update({ role: "hotelOwner" }, { where: { id: ownerId } });
        }

        res.json({ success: true, message: "Đăng ký homestay thành công! Hồ sơ đang chờ Quản trị viên phê duyệt.", hotel });
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

// PUT /api/hotels/my-hotel (Upsert: create with status "pending" if hotelOwner has no Hotel yet)
export const updateMyHotel = async (req, res) => {
    try {
        const { name, address, contact, city, description, image } = req.body;
        const uploadedImageUrl = req.file ? getUploadedFileUrl(req, req.file.filename) : undefined;
        let hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });

        if (!hotel) {
            if (!name || !address || !contact || !city) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng điền đầy đủ thông tin bắt buộc (Tên homestay, Số điện thoại, Địa chỉ, Thành phố) để tạo hồ sơ Homestay.",
                });
            }

            hotel = await Hotel.create({
                name: String(name).trim(),
                address: String(address).trim(),
                contact: String(contact).trim(),
                city: String(city).trim(),
                description: description ? String(description).trim() : "",
                image: uploadedImageUrl || (image ? String(image).trim() : ""),
                ownerId: req.user.id,
                status: "pending",
            });

            if (req.user.role !== "admin" && req.user.role !== "hotelOwner") {
                await User.update({ role: "hotelOwner" }, { where: { id: req.user.id } });
            }

            return res.status(201).json({
                success: true,
                created: true,
                message: "Tạo hồ sơ homestay thành công! Hồ sơ đang chờ Quản trị viên phê duyệt.",
                hotel,
            });
        }

        if (name && String(name).trim()) hotel.name = String(name).trim();
        if (address && String(address).trim()) hotel.address = String(address).trim();
        if (contact && String(contact).trim()) hotel.contact = String(contact).trim();
        if (city && String(city).trim()) hotel.city = String(city).trim();
        if (description !== undefined) hotel.description = String(description);
        if (uploadedImageUrl) {
            hotel.image = uploadedImageUrl;
        } else if (image !== undefined) {
            hotel.image = String(image).trim();
        }

        await hotel.save();

        res.json({ success: true, created: false, message: "Cập nhật thông tin homestay thành công!", hotel });
    } catch (error) {
        console.error("Update my hotel error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
