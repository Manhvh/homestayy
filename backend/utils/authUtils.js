import crypto from 'crypto';

const base64UrlEncode = (str) => Buffer.from(str).toString('base64url');
const base64UrlDecode = (str) => Buffer.from(str, 'base64url').toString('utf8');

const JWT_SECRET = process.env.JWT_SECRET || 'homestay_graduation_secret_key_2026';

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
