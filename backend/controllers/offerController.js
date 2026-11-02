import { Op } from "sequelize";
import { Offer, Hotel } from "../models/index.js";

// Initial default offers to auto-seed if table is empty
const DEFAULT_OFFERS = [
    {
        code: "SUMMER25",
        title: "Gói Nghỉ Dưỡng Mùa Hè",
        description: "Tặng 1 đêm nghỉ dưỡng kèm bữa sáng tự chọn đặc sản địa phương khi đặt phòng homestay từ 2 đêm.",
        priceOff: 25,
        maxDiscount: 500000,
        minNights: 2,
        expiryDate: "2026-08-31",
        badge: "HOT DEAL",
        category: "summer",
        terms: [
            "Giảm trực tiếp 25% tổng tiền phòng (tối đa 500.000 VNĐ).",
            "Áp dụng cho các đơn đặt từ 2 đêm trở lên trong mùa hè này.",
            "Miễn phí bữa sáng tự chọn đặc sản tại homestay.",
            "Cho phép thay đổi lịch đặt trước 48h miễn phí."
        ],
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000",
        isActive: true,
    },
    {
        code: "ROMANCE20",
        title: "Kỳ Nghỉ Lãng Mạn Cặp Đôi",
        description: "Gói tuần trăng mật đặc biệt bao gồm liệu trình spa thư giãn, hoa tươi và rượu vang chúc mừng.",
        priceOff: 20,
        maxDiscount: 400000,
        minNights: 1,
        expiryDate: "2026-09-20",
        badge: "LÃNG MẠN",
        category: "couple",
        terms: [
            "Giảm 20% cho phòng đôi, phòng Suite hoặc Villa riêng tư (tối đa 400.000 VNĐ).",
            "Tặng set trà chiều bánh ngọt và hoa tươi chào đón tại phòng.",
            "Ưu đãi giảm 30% gói dịch vụ spa & tiệc tối riêng cho 2 người.",
            "Áp dụng cho mọi homestay trên toàn quốc."
        ],
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000",
        isActive: true,
    },
    {
        code: "EARLYBIRD30",
        title: "Ưu Đãi Đặt Sớm Homestay",
        description: "Đặt trước 14 ngày để nhận mức giá ưu đãi tốt nhất trên toàn hệ thống homestay Việt Nam.",
        priceOff: 30,
        maxDiscount: 600000,
        minNights: 1,
        expiryDate: "2026-09-25",
        badge: "TIẾT KIỆM 30%",
        category: "early",
        terms: [
            "Giảm 30% tổng hóa đơn khi đặt trước ngày nhận phòng tối thiểu 14 ngày (tối đa 600.000 VNĐ).",
            "Áp dụng cho toàn bộ danh mục homestay và khu nghỉ dưỡng.",
            "Hỗ trợ dời ngày lưu trú 1 lần miễn phí trước 7 ngày.",
            "Không áp dụng đồng thời với các voucher ưu đãi khác."
        ],
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
        isActive: true,
    },
    {
        code: "WEEKEND15",
        title: "Cuối Tuần Thảnh Thơi",
        description: "Nạp năng lượng cuối tuần với không gian xanh mát, tiệc nướng BBQ ngoài trời và trà thảo mộc.",
        priceOff: 15,
        maxDiscount: 300000,
        minNights: 1,
        expiryDate: "2026-10-31",
        badge: "CUỐI TUẦN",
        category: "weekend",
        terms: [
            "Giảm 15% tổng tiền phòng (tối đa 300.000 VNĐ) cho các ngày Thứ 6, Thứ 7 hoặc Chủ Nhật.",
            "Miễn phí sử dụng bếp nướng BBQ và khu sinh hoạt chung.",
            "Hỗ trợ nhận phòng sớm hoặc trả phòng muộn đến 14:00 (nếu còn phòng trống)."
        ],
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000",
        isActive: true,
    },
    {
        code: "WELCOME10",
        title: "Chào Mừng Khách Hàng Mới",
        description: "Ưu đãi đặc quyền dành riêng cho lần đầu tiên trải nghiệm dịch vụ lưu trú tại HomeStay.",
        priceOff: 10,
        maxDiscount: 200000,
        minNights: 1,
        expiryDate: "2026-12-31",
        badge: "THÀNH VIÊN",
        category: "all",
        terms: [
            "Giảm ngay 10% (tối đa 200.000 VNĐ) cho đơn đặt phòng đầu tiên của tài khoản.",
            "Không yêu cầu số đêm tối thiểu hay giới hạn địa điểm.",
            "Tự động tích lũy điểm thưởng thành viên sau khi check-out."
        ],
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000",
        isActive: true,
    },
    {
        code: "LONGSTAY25",
        title: "Lưu Trú Dài Ngày Siêu Tiết Kiệm",
        description: "Trải nghiệm cuộc sống như người bản địa với mức giá ưu đãi khi lưu trú từ 4 đêm trở lên.",
        priceOff: 25,
        maxDiscount: 800000,
        minNights: 4,
        expiryDate: "2026-11-15",
        badge: "DÀI NGÀY",
        category: "longstay",
        terms: [
            "Giảm 25% tổng tiền phòng cho kỳ nghỉ từ 4 đêm trở lên (tối đa 800.000 VNĐ).",
            "Miễn phí dịch vụ giặt ủi đồ cơ bản và dọn phòng định kỳ.",
            "Cung cấp gói hướng dẫn viên bản địa tư vấn lịch trình khám phá địa phương."
        ],
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000",
        isActive: true,
    }
];

// Helper to auto seed default offers if table is empty
const ensureDefaultOffers = async () => {
    try {
        const count = await Offer.count();
        if (count === 0) {
            await Offer.bulkCreate(DEFAULT_OFFERS);
            console.log("Auto-seeded default exclusive offers into database.");
        }
    } catch (err) {
        console.warn("Could not check/seed offers:", err.message);
    }
};

// 1. Get all active offers for public display (Homepage & Booking Modal)
export const getAllOffers = async (req, res) => {
    try {
        await ensureDefaultOffers();

        const offers = await Offer.findAll({
            where: { isActive: true },
            include: [{ model: Hotel, as: "hotel", attributes: ["id", "name", "city"] }],
            order: [["createdAt", "DESC"]],
        });

        res.json({ success: true, offers });
    } catch (error) {
        console.error("Get all offers error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get all offers managed by the authenticated hotel owner
export const getOwnerOffers = async (req, res) => {
    try {
        await ensureDefaultOffers();

        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });
        const hotelId = hotel ? hotel.id : null;

        // Fetch offers belonging to this owner or hotel (or global default offers where ownerId is null)
        const orConditions = [{ ownerId: req.user.id }, { ownerId: null }];
        if (hotelId) {
            orConditions.push({ hotelId });
        }

        let offers = await Offer.findAll({
            where: {
                [Op.or]: orConditions,
            },
            include: [{ model: Hotel, as: "hotel", attributes: ["id", "name", "city"] }],
            order: [["createdAt", "DESC"]],
        });

        // Fallback: If still empty, return all offers
        if (offers.length === 0) {
            offers = await Offer.findAll({
                include: [{ model: Hotel, as: "hotel", attributes: ["id", "name", "city"] }],
                order: [["createdAt", "DESC"]],
            });
        }

        res.json({ success: true, offers });
    } catch (error) {
        console.error("Get owner offers error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Create a new offer by Hotel Owner
export const createOffer = async (req, res) => {
    try {
        const {
            code,
            title,
            description,
            priceOff,
            maxDiscount,
            minNights,
            expiryDate,
            badge,
            category,
            terms,
        } = req.body;

        if (!code || !title || !priceOff || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ mã ưu đãi, tiêu đề, mức giảm giá và ngày hết hạn!",
            });
        }

        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });

        // Handle uploaded image
        let image = "";
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image;
        } else {
            image = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000";
        }

        // Parse terms if string
        let termsArray = [];
        if (terms) {
            if (Array.isArray(terms)) {
                termsArray = terms;
            } else if (typeof terms === "string") {
                try {
                    termsArray = JSON.parse(terms);
                } catch {
                    termsArray = terms.split("\n").map(s => s.trim()).filter(Boolean);
                }
            }
        }

        const cleanCode = code.trim().toUpperCase();

        // Check if code already exists for this owner
        const existing = await Offer.findOne({ where: { code: cleanCode } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Mã ưu đãi "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác!`,
            });
        }

        const newOffer = await Offer.create({
            code: cleanCode,
            title: title.trim(),
            description: description || "",
            priceOff: Math.min(100, Math.max(1, parseInt(priceOff, 10))),
            maxDiscount: Number(maxDiscount) || 500000,
            minNights: Math.max(1, parseInt(minNights, 10) || 1),
            expiryDate,
            badge: badge || "HOT DEAL",
            category: category || "summer",
            terms: termsArray,
            image,
            isActive: true,
            hotelId: hotel ? hotel.id : null,
            ownerId: req.user.id,
        });

        res.json({
            success: true,
            message: "Tạo chương trình ưu đãi thành công!",
            offer: newOffer,
        });
    } catch (error) {
        console.error("Create offer error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update an existing offer
export const updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findByPk(id);

        if (!offer) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chương trình ưu đãi!" });
        }

        const {
            code,
            title,
            description,
            priceOff,
            maxDiscount,
            minNights,
            expiryDate,
            badge,
            category,
            terms,
            isActive,
        } = req.body;

        if (code) offer.code = code.trim().toUpperCase();
        if (title) offer.title = title.trim();
        if (description !== undefined) offer.description = description;
        if (priceOff !== undefined) offer.priceOff = Math.min(100, Math.max(1, parseInt(priceOff, 10)));
        if (maxDiscount !== undefined) offer.maxDiscount = Number(maxDiscount);
        if (minNights !== undefined) offer.minNights = Math.max(1, parseInt(minNights, 10));
        if (expiryDate) offer.expiryDate = expiryDate;
        if (badge) offer.badge = badge;
        if (category) offer.category = category;
        if (isActive !== undefined) offer.isActive = isActive === true || isActive === "true";

        if (terms !== undefined) {
            if (Array.isArray(terms)) {
                offer.terms = terms;
            } else if (typeof terms === "string") {
                try {
                    offer.terms = JSON.parse(terms);
                } catch {
                    offer.terms = terms.split("\n").map(s => s.trim()).filter(Boolean);
                }
            }
        }

        if (req.file) {
            offer.image = `/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            offer.image = req.body.image;
        }

        await offer.save();

        res.json({
            success: true,
            message: "Cập nhật ưu đãi thành công!",
            offer,
        });
    } catch (error) {
        console.error("Update offer error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete an offer
export const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await Offer.destroy({ where: { id } });

        if (!count) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ưu đãi cần xóa!" });
        }

        res.json({ success: true, message: "Đã xóa ưu đãi thành công!" });
    } catch (error) {
        console.error("Delete offer error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Toggle offer active status
export const toggleOfferStatus = async (req, res) => {
    try {
        const { id } = req.body;
        const offer = await Offer.findByPk(id);

        if (!offer) {
            return res.status(404).json({ success: false, message: "Không tìm thấy chương trình ưu đãi!" });
        }

        offer.isActive = !offer.isActive;
        await offer.save();

        res.json({
            success: true,
            message: offer.isActive ? "Đã bật ưu đãi" : "Đã tạm dừng ưu đãi",
            isActive: offer.isActive,
        });
    } catch (error) {
        console.error("Toggle offer status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
