import crypto from 'crypto';

const base64UrlEncode = (str) => Buffer.from(str).toString('base64url');
const base64UrlDecode = (str) => Buffer.from(str, 'base64url').toString('utf8');

const JWT_SECRET = process.env.JWT_SECRET || 'homestay_graduation_secret_key_2026';

/**
 * Validate password strength for registration, reset, and password change
 * Rules: >= 8 chars, no spaces, >= 1 uppercase, >= 1 lowercase, >= 1 number, >= 1 special char
 */
export const validatePasswordStrength = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Vui lòng nhập mật khẩu.' };
    }
    if (/\s/.test(password)) {
        return { valid: false, message: 'Mật khẩu không được chứa khoảng trắng.' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
    }
    if (password.length > 64) {
        return { valid: false, message: 'Mật khẩu không được vượt quá 64 ký tự.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ cái viết thường (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`;']/.test(password)) {
        return { valid: false, message: 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (ví dụ: @, #, $, !, %...).' };
    }
    return { valid: true, message: 'Mật khẩu hợp lệ.' };
};

/**
 * Hash password using crypto.scrypt
 */
export const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
};

/**
 * Verify password against stored salt:hash
 */
export const verifyPassword = (password, storedHash) => {
    try {
        if (!storedHash || !storedHash.includes(':')) return false;
        const [salt, key] = storedHash.split(':');
        const keyBuffer = Buffer.from(key, 'hex');
        const derivedKey = crypto.scryptSync(password, salt, 64);
        return crypto.timingSafeEqual(keyBuffer, derivedKey);
    } catch {
        return false;
    }
};

/**
 * Generate standard HMAC-SHA256 JWT
 */
export const generateToken = (userId, role = 'user') => {
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64UrlEncode(JSON.stringify({
        userId,
        role,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    }));
    const signature = crypto.createHmac('sha256', JWT_SECRET)
                            .update(`${header}.${payload}`)
                            .digest('base64url');
    return `${header}.${payload}.${signature}`;
};

/**
 * Verify and decode HMAC-SHA256 JWT
 */
export const verifyToken = (token) => {
    try {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [header, payload, signature] = parts;
        const expectedSig = crypto.createHmac('sha256', JWT_SECRET)
                                  .update(`${header}.${payload}`)
                                  .digest('base64url');

        if (signature !== expectedSig) return null;

        const data = JSON.parse(base64UrlDecode(payload));
        if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
            return null; // Token expired
        }
        return data;
    } catch {
        return null;
    }
};
