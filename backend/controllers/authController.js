import crypto from 'crypto';
import User from '../models/User.js';
import {
    hashPassword,
    verifyPassword,
    generateToken,
    validatePasswordStrength,
    hashOtp,
    verifyOtpHash,
} from '../utils/authUtils.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailService.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_OTP_ATTEMPTS = 5;

// Store pending registration OTP codes by email: Map<email, { codeHash, expiresAt, attempts }>
const pendingVerifyCodes = new Map();
// Track failed reset OTP attempts in memory per email: Map<email, number>
const resetOtpAttempts = new Map();

// POST /api/auth/send-verify-code
export const sendVerifyCode = async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập địa chỉ email để nhận mã xác thực." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ where: { email: cleanEmail } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng. Vui lòng đăng nhập." });
        }

        const code = String(crypto.randomInt(100000, 1000000));
        const expiresAt = Date.now() + OTP_TTL_MS;
        pendingVerifyCodes.set(cleanEmail, {
            codeHash: hashOtp(code),
            expiresAt,
            attempts: 0,
        });

        const mailSent = await sendVerificationEmail({ email: cleanEmail, username, code });

        const responsePayload = {
            success: true,
            mailSent,
            message: mailSent
                ? `Đã gửi mã xác thực tới email ${cleanEmail}! (Có hiệu lực trong 5 phút)`
                : `Mã xác thực của bạn là: ${code} (Có hiệu lực trong 5 phút)`,
        };
        if (!mailSent) {
            responsePayload.verifyCode = code;
        }

        res.json(responsePayload);
    } catch (error) {
        console.error("Send verify code error:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi gửi mã xác thực." });
    }
};

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, email, password, phone, role, codeVerify } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tên, email và mật khẩu." });
        }

        const passValidation = validatePasswordStrength(password);
        if (!passValidation.valid) {
            return res.status(400).json({ success: false, message: passValidation.message });
        }

        if (!codeVerify || !String(codeVerify).trim()) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập mã xác thực để đăng ký tài khoản." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanCode = String(codeVerify).trim();

        const existingUser = await User.findOne({ where: { email: cleanEmail } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng. Vui lòng đăng nhập." });
        }

        const pending = pendingVerifyCodes.get(cleanEmail);
        if (!pending) {
            return res.status(400).json({ success: false, message: "Vui lòng lấy mã xác thực cho email này trước khi đăng ký." });
        }
        if (pending.expiresAt < Date.now()) {
            pendingVerifyCodes.delete(cleanEmail);
            return res.status(400).json({ success: false, message: "Mã xác thực đã hết hạn. Vui lòng lấy mã mới." });
        }
        if (!verifyOtpHash(cleanCode, pending.codeHash)) {
            pending.attempts += 1;
            if (pending.attempts >= MAX_OTP_ATTEMPTS) {
                pendingVerifyCodes.delete(cleanEmail);
                return res.status(400).json({
                    success: false,
                    message: "Bạn đã nhập sai mã xác thực quá số lần cho phép. Vui lòng yêu cầu mã mới.",
                });
            }
            return res.status(400).json({ success: false, message: "Mã xác thực không chính xác." });
        }
        pendingVerifyCodes.delete(cleanEmail);

        const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const hashedPassword = hashPassword(password);
        // Public registration can only register as 'user' or 'hotelOwner'.
        const userRole = role === "hotelOwner" ? "hotelOwner" : "user";

        const newUser = await User.create({
            id: userId,
            username: username.trim(),
            email: cleanEmail,
            password: hashedPassword,
            phone: phone ? phone.trim() : "",
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username.trim())}`,
            role: userRole,
            isBlocked: false,
            isVerified: true,
            codeVerify: null,
            resetOtpHash: null,
            resetOtpExpiresAt: null,
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
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: "Email này đã được sử dụng. Vui lòng đăng nhập." });
        }
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

        if (!user.password || !verifyPassword(password, user.password)) {
            return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không chính xác." });
        }

        if (user.isVerified === false) {
            return res.status(403).json({ success: false, message: "Tài khoản chưa được xác thực. Vui lòng xác thực email trước khi đăng nhập." });
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

// POST /api/auth/forgot-password
export const sendResetCode = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập địa chỉ email tài khoản." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ where: { email: cleanEmail } });
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản với địa chỉ email này." });
        }

        const code = String(crypto.randomInt(100000, 1000000));
        user.resetOtpHash = hashOtp(code);
        user.resetOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
        await user.save();
        resetOtpAttempts.set(cleanEmail, 0);

        const mailSent = await sendPasswordResetEmail({ email: cleanEmail, username: user.username, code });

        const responsePayload = {
            success: true,
            mailSent,
            message: mailSent
                ? `Đã gửi mã đặt lại mật khẩu tới email ${cleanEmail}! (Có hiệu lực trong 5 phút)`
                : `Mã xác thực đặt lại mật khẩu của bạn là: ${code} (Có hiệu lực trong 5 phút)`,
        };
        if (!mailSent) {
            responsePayload.verifyCode = code;
        }

        res.json(responsePayload);
    } catch (error) {
        console.error("Send reset code error:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi gửi mã đặt lại mật khẩu." });
    }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { email, codeVerify, newPassword } = req.body;
        if (!email || !codeVerify || !newPassword) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ email, mã xác thực và mật khẩu mới." });
        }

        const passValidation = validatePasswordStrength(newPassword);
        if (!passValidation.valid) {
            return res.status(400).json({ success: false, message: passValidation.message });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanCode = String(codeVerify).trim();

        const user = await User.findOne({ where: { email: cleanEmail } });
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản với email này." });
        }

        if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "Bạn chưa yêu cầu mã đặt lại mật khẩu hoặc mã đã được sử dụng. Vui lòng lấy mã mới.",
            });
        }

        if (new Date(user.resetOtpExpiresAt).getTime() < Date.now()) {
            user.resetOtpHash = null;
            user.resetOtpExpiresAt = null;
            await user.save();
            resetOtpAttempts.delete(cleanEmail);
            return res.status(400).json({
                success: false,
                message: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã đặt lại mật khẩu mới.",
            });
        }

        if (!verifyOtpHash(cleanCode, user.resetOtpHash)) {
            const attempts = (resetOtpAttempts.get(cleanEmail) || 0) + 1;
            if (attempts >= MAX_OTP_ATTEMPTS) {
                user.resetOtpHash = null;
                user.resetOtpExpiresAt = null;
                await user.save();
                resetOtpAttempts.delete(cleanEmail);
                return res.status(400).json({
                    success: false,
                    message: "Bạn đã nhập sai mã xác thực quá 5 lần. Vui lòng yêu cầu mã mới.",
                });
            }
            resetOtpAttempts.set(cleanEmail, attempts);
            return res.status(400).json({ success: false, message: "Mã xác thực không chính xác." });
        }

        // Single-use OTP: clear immediately after verification
        user.password = hashPassword(newPassword);
        user.resetOtpHash = null;
        user.resetOtpExpiresAt = null;
        await user.save();
        resetOtpAttempts.delete(cleanEmail);

        res.json({
            success: true,
            message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi đặt lại mật khẩu." });
    }
};

// PUT /api/auth/change-password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const passValidation = validatePasswordStrength(newPassword);
        if (!passValidation.valid) {
            return res.status(400).json({ success: false, message: passValidation.message });
        }

        if (currentPassword && currentPassword === newPassword) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới không được trùng với mật khẩu hiện tại." });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
        }

        if (user.password) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu hiện tại." });
            }
            const isMatch = verifyPassword(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Mật khẩu hiện tại không chính xác." });
            }
        }

        user.password = hashPassword(newPassword);
        await user.save();

        res.json({
            success: true,
            message: "Đổi mật khẩu thành công!",
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi đổi mật khẩu." });
    }
};
