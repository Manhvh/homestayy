import crypto from 'crypto';
import User from '../models/User.js';
import transporter from '../configs/nodemailer.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/authUtils.js';

// Store pending verification codes by email: Map<email, { code, expiresAt }>
const pendingVerifyCodes = new Map();

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

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = Date.now() + 9 * 60 * 1000;
        pendingVerifyCodes.set(cleanEmail, { code, expiresAt });

        let mailSent = false;
        if (process.env.SENDER_EMAIL && process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                await transporter.sendMail({
                    from: process.env.SENDER_EMAIL,
                    to: cleanEmail,
                    subject: 'HomeStay - Mã xác thực đăng ký tài khoản',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
                            <h2 style="color: #1d4ed8; margin-top: 0;">Xác thực tài khoản HomeStay</h2>
                            <p>Xin chào <strong>${username || cleanEmail}</strong>,</p>
                            <p>Mã xác thực để hoàn tất đăng ký tài khoản của bạn là:</p>
                            <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e40af; background: #eff6ff; padding: 14px 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
                                ${code}
                            </div>
                            <p style="font-size: 12px; color: #6b7280;">Mã có hiệu lực trong vòng 1 phút.</p>
                        </div>
                    `,
                });
                mailSent = true;
            } catch (mailError) {
                console.warn("Send verify code email skipped:", mailError.message);
            }
        }

        res.json({
            success: true,
            mailSent,
            verifyCode: code,
            message: mailSent
                ? `Đã gửi mã xác thực tới email ${cleanEmail}!`
                : `Mã xác thực của bạn là: ${code}`,
        });
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

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu phải chứa ít nhất 6 ký tự." });
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
        if (pending.code !== cleanCode) {
            return res.status(400).json({ success: false, message: "Mã xác thực không chính xác." });
        }
        pendingVerifyCodes.delete(cleanEmail);

        const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const hashedPassword = hashPassword(password);
        // Public registration can only register as 'user' or 'hotelOwner'.
        // Admin accounts can only be activated from within the admin dashboard.
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
            codeVerify: cleanCode,
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

        if (!user.password || !verifyPassword(password, user.password)) {
            return res.status(400).json({ success: false, message: "Email hoặc mật khẩu không chính xác." });
        }

        if (!user.codeVerify) {
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

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = Date.now() + 10 * 60 * 1000;
        pendingVerifyCodes.set(`reset_${cleanEmail}`, { code, expiresAt });

        user.codeVerify = code;
        await user.save();

        let mailSent = false;
        if (process.env.SENDER_EMAIL && process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                await transporter.sendMail({
                    from: process.env.SENDER_EMAIL,
                    to: cleanEmail,
                    subject: 'HomeStay - Mã xác thực đặt lại mật khẩu',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
                            <h2 style="color: #1d4ed8; margin-top: 0;">Đặt lại mật khẩu HomeStay</h2>
                            <p>Xin chào <strong>${user.username || cleanEmail}</strong>,</p>
                            <p>Mã xác thực để đặt lại mật khẩu tài khoản của bạn là:</p>
                            <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1e40af; background: #eff6ff; padding: 14px 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
                                ${code}
                            </div>
                            <p style="font-size: 12px; color: #6b7280;">Mã có hiệu lực trong vòng 10 phút.</p>
                        </div>
                    `,
                });
                mailSent = true;
            } catch (mailError) {
                console.warn("Send reset password email skipped:", mailError.message);
            }
        }

        res.json({
            success: true,
            mailSent,
            verifyCode: code,
            message: mailSent
                ? `Đã gửi mã đặt lại mật khẩu tới email ${cleanEmail}!`
                : `Mã xác thực đặt lại mật khẩu của bạn là: ${code}`,
        });
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

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanCode = String(codeVerify).trim();

        const user = await User.findOne({ where: { email: cleanEmail } });
        if (!user) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản với email này." });
        }

        const pending = pendingVerifyCodes.get(`reset_${cleanEmail}`);
        const isCodeValid =
            (pending && pending.expiresAt >= Date.now() && pending.code === cleanCode) ||
            (user.codeVerify && String(user.codeVerify).trim() === cleanCode);

        if (!isCodeValid) {
            return res.status(400).json({ success: false, message: "Mã xác thực không chính xác hoặc đã hết hạn." });
        }

        pendingVerifyCodes.delete(`reset_${cleanEmail}`);
        user.password = hashPassword(newPassword);
        user.codeVerify = cleanCode;
        await user.save();

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
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Mật khẩu mới phải chứa ít nhất 6 ký tự." });
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
