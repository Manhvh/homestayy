import crypto from 'crypto';
import User from '../models/User.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/authUtils.js';

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tên, email và mật khẩu." });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu phải chứa ít nhất 6 ký tự." });
        }

        const existingUser = await User.findOne({ where: { email: email.toLowerCase().trim() } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng. Vui lòng đăng nhập." });
        }

        const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const hashedPassword = hashPassword(password);
        const userRole = role === "hotelOwner" ? "hotelOwner" : (role === "admin" ? "admin" : "user");

        const newUser = await User.create({
            id: userId,
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username.trim())}`,
            role: userRole,
            isBlocked: false,
            recentSearchedCities: [],
        });

        const token = generateToken(newUser.id, newUser.role);

        res.status(201).json({
            success: true,
            message: "Đăng ký tài khoản thành công!",
            token,
            user: newUser.toJSON(),
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi đăng ký tài khoản." });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập email và mật khẩu." });
        }

        const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không chính xác." });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin." });
        }

        // If user has a password set, verify it
        if (user.password) {
            const isMatch = verifyPassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không chính xác." });
            }
        } else {
            // For older accounts without password, set password on first login
            user.password = hashPassword(password);
            await user.save();
        }

        const token = generateToken(user.id, user.role);

        res.json({
            success: true,
            message: "Đăng nhập thành công!",
            token,
            user: user.toJSON(),
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi đăng nhập." });
    }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user.toJSON(),
            role: req.user.role,
            isBlocked: req.user.isBlocked,
            recentSearchedCities: req.user.recentSearchedCities || [],
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
