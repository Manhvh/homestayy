import { Op } from "sequelize";
import { Category } from "../models/index.js";

const DEFAULT_AMENITIES = [
    { name: "Free WiFi", type: "amenity", description: "Kết nối Internet tốc độ cao miễn phí" },
    { name: "Free Breakfast", type: "amenity", description: "Bữa sáng miễn phí hàng ngày" },
    { name: "Room Service", type: "amenity", description: "Dịch vụ phục vụ tại phòng" },
    { name: "Mountain View", type: "amenity", description: "Tầm nhìn hướng núi tuyệt đẹp" },
    { name: "Pool Access", type: "amenity", description: "Hồ bơi ngoài trời/trong nhà" },
    { name: "Air Conditioning", type: "amenity", description: "Điều hòa hai chiều" },
    { name: "Kitchen", type: "amenity", description: "Bếp nấu ăn đầy đủ tiện nghi" },
    { name: "Parking", type: "amenity", description: "Bãi đỗ xe an toàn miễn phí" },
];

const DEFAULT_CITIES = [
    { name: "Đà Lạt", type: "city", description: "Thành phố ngàn hoa thơ mộng" },
    { name: "Hà Nội", type: "city", description: "Thủ đô ngàn năm văn hiến" },
    { name: "TP. Hồ Chí Minh", type: "city", description: "Trung tâm kinh tế sầm uất" },
    { name: "Đà Nẵng", type: "city", description: "Thành phố đáng sống ven biển" },
    { name: "Nha Trang", type: "city", description: "Vịnh biển nhiệt đới quyến rũ" },
    { name: "Sa Pa", type: "city", description: "Thị trấn sương mù kỳ vĩ" },
    { name: "Phú Quốc", type: "city", description: "Đảo ngọc thiên đường nghỉ dưỡng" },
    { name: "Hội An", type: "city", description: "Đô thị cổ thanh bình" },
    { name: "Vũng Tàu", type: "city", description: "Điểm đến biển cuối tuần" },
    { name: "Ninh Bình", type: "city", description: "Vịnh Hạ Long trên cạn" },
];

// Seed defaults if empty
const ensureDefaults = async () => {
    try {
        const count = await Category.count();
        if (count === 0) {
            await Category.bulkCreate([...DEFAULT_AMENITIES, ...DEFAULT_CITIES], { ignoreDuplicates: true });
        }
    } catch (err) {
        console.error("Auto seeding categories failed:", err.message);
    }
};

// GET /api/categories
export const getCategories = async (req, res) => {
    try {
        await ensureDefaults();
        const categories = await Category.findAll({ order: [["createdAt", "DESC"]] });

        const amenities = categories.filter(c => c.type === "amenity");
        const cities = categories.filter(c => c.type === "city");

        res.json({
            success: true,
            categories,
            amenities,
            cities,
        });
    } catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/categories (Admin only)
export const addCategory = async (req, res) => {
    try {
        const { name, type, icon, description } = req.body;

        if (!name || !type) {
            return res.status(400).json({ success: false, message: "Tên và loại danh mục là bắt buộc." });
        }

        if (!["amenity", "city"].includes(type)) {
            return res.status(400).json({ success: false, message: "Loại danh mục phải là 'amenity' hoặc 'city'." });
        }

        const existing = await Category.findOne({ where: { name: name.trim(), type } });
        if (existing) {
            return res.status(400).json({ success: false, message: "Danh mục này đã tồn tại." });
        }

        const category = await Category.create({
            name: name.trim(),
            type,
            icon: icon || "",
            description: description || "",
        });

        res.json({ success: true, message: "Thêm danh mục thành công!", category });
    } catch (error) {
        console.error("Add category error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/categories/:id (Admin only)
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, icon, description } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục cần sửa." });
        }

        const nextName = name !== undefined ? String(name).trim() : category.name;
        const nextType = type !== undefined ? String(type).trim() : category.type;

        if (!nextName) {
            return res.status(400).json({ success: false, message: "Tên danh mục không được để trống." });
        }

        if (!["amenity", "city"].includes(nextType)) {
            return res.status(400).json({ success: false, message: "Loại danh mục phải là 'amenity' hoặc 'city'." });
        }

        const duplicate = await Category.findOne({
            where: {
                name: nextName,
                type: nextType,
                id: { [Op.ne]: id },
            },
        });
        if (duplicate) {
            return res.status(400).json({ success: false, message: "Tên danh mục này đã tồn tại trong cùng phân loại." });
        }

        category.name = nextName;
        category.type = nextType;
        if (icon !== undefined) category.icon = String(icon).trim();
        if (description !== undefined) category.description = String(description).trim();

        await category.save();

        res.json({ success: true, message: "Cập nhật danh mục thành công!", category });
    } catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/categories/:id (Admin only)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const count = await Category.destroy({ where: { id } });

        if (!count) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục cần xóa." });
        }

        res.json({ success: true, message: "Đã xóa danh mục thành công!" });
    } catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
