import User from "../models/User.js";
import { verifyToken } from "../utils/authUtils.js";

// Middleware to check if user is authenticated via JWT
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Vui lòng đăng nhập để tiếp tục." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ success: false, message: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ." });
        }

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "Người dùng không tồn tại." });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa." });
        }

        req.user = user;
        req.user._id = user.id;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ success: false, message: "Lỗi xác thực người dùng." });
    }
};

// Middleware to check if user is Admin
export const adminProtect = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Chưa xác thực người dùng." });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Quyền truy cập bị từ chối: Chỉ dành cho Quản trị viên." });
        }

        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        return res.status(500).json({ success: false, message: "Lỗi phân quyền quản trị." });
    }
};
