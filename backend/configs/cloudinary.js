import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const isPlaceholderValue = (value) => {
    const str = String(value || "").trim();
    if (!str) return true;
    if (/^\*+$/.test(str)) return true;
    const lower = str.toLowerCase();
    return (
        lower.startsWith("your_") ||
        lower.startsWith("<") ||
        lower === "changeme" ||
        lower === "secret"
    );
};

/**
 * Parse Cloudinary credentials from CLOUDINARY_URL or individual CLOUDINARY_* env vars.
 */
export const parseCloudinaryConfig = (env = process.env) => {
    let cloudName = (env.CLOUDINARY_CLOUD_NAME || "").trim();
    let apiKey = (env.CLOUDINARY_API_KEY || "").trim();
    let apiSecret = (env.CLOUDINARY_API_SECRET || "").trim();

    const rawUrl = (env.CLOUDINARY_URL || "").trim();
    if (rawUrl && rawUrl.startsWith("cloudinary://")) {
        try {
            const parsed = new URL(rawUrl);
            if (isPlaceholderValue(apiKey) && parsed.username) {
                apiKey = decodeURIComponent(parsed.username);
            }
            if (isPlaceholderValue(apiSecret) && parsed.password) {
                apiSecret = decodeURIComponent(parsed.password);
            }
            if (isPlaceholderValue(cloudName) && parsed.hostname) {
                cloudName = parsed.hostname;
            }
        } catch {
            // Ignore malformed URL; handled by validation below
        }
    }

    const configured =
        !isPlaceholderValue(cloudName) &&
        !isPlaceholderValue(apiKey) &&
        !isPlaceholderValue(apiSecret);

    return {
        cloudName,
        apiKey,
        apiSecret,
        configured,
    };
};

let lastConfiguredSignature = "";

const ensureConfigured = () => {
    const cfg = parseCloudinaryConfig();
    if (!cfg.configured) {
        return { ...cfg };
    }
    const sig = `${cfg.cloudName}:${cfg.apiKey}:${cfg.apiSecret}`;
    if (sig !== lastConfiguredSignature) {
        cloudinary.config({
            cloud_name: cfg.cloudName,
            api_key: cfg.apiKey,
            api_secret: cfg.apiSecret,
            secure: true,
        });
        lastConfiguredSignature = sig;
    }
    return cfg;
};

export const isCloudinaryConfigured = (env = process.env) =>
    parseCloudinaryConfig(env).configured;

export const verifyCloudinary = async () => {
    const cfg = ensureConfigured();
    if (!cfg.configured) {
        console.warn(
            "Cloudinary warning: Chưa cấu hình đủ CLOUDINARY_URL / API Secret hợp lệ (vẫn đang là placeholder hoặc trống). Hệ thống tạm dùng lưu ảnh cục bộ (/uploads)."
        );
        return false;
    }

    try {
        await cloudinary.api.ping();
        console.log(`Successfully connected to Cloudinary (cloud: ${cfg.cloudName})!`);
        return true;
    } catch (error) {
        console.error("Cloudinary connection error:", error.message || error);
        return false;
    }
};

/**
 * Upload an image Buffer directly to Cloudinary via upload_stream (no local temp file needed).
 */
export const uploadBufferToCloudinary = (buffer, folder = "homestay/uploads") => {
    const cfg = ensureConfigured();
    if (!cfg.configured) {
        throw new Error("Cloudinary chưa được cấu hình đầy đủ (thiếu API Secret hợp lệ).");
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
            (error, result) => {
                if (error) return reject(error);
                return resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                });
            }
        );

        uploadStream.end(buffer);
    });
};

/**
 * Extract Cloudinary public_id from a res.cloudinary.com secure_url.
 * Example: https://res.cloudinary.com/uy7pfup1/image/upload/v1700000000/homestay/rooms/abc123.webp
 *       -> homestay/rooms/abc123
 */
export const extractCloudinaryPublicId = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") return null;
    try {
        const u = new URL(imageUrl);
        if (!u.hostname.endsWith("cloudinary.com")) return null;
        const uploadMarker = "/upload/";
        const idx = u.pathname.indexOf(uploadMarker);
        if (idx === -1) return null;

        let afterUpload = u.pathname.slice(idx + uploadMarker.length);
        // Strip optional transformation segments before version (e.g. c_fill,w_500/v12345/...)
        const versionMatch = afterUpload.match(/(?:^|\/)v\d+\/(.+)$/);
        if (versionMatch) {
            afterUpload = versionMatch[1];
        } else {
            afterUpload = afterUpload.replace(/^\/+/, "");
        }

        // Remove file extension
        const withoutExt = afterUpload.replace(/\.[a-zA-Z0-9]+$/, "");
        return withoutExt || null;
    } catch {
        return null;
    }
};

/**
 * Safely delete an existing image on Cloudinary (non-blocking cleanup when replacing/deleting).
 */
export const deleteCloudinaryImage = async (imageUrl) => {
    try {
        const cfg = ensureConfigured();
        if (!cfg.configured) return false;
        const publicId = extractCloudinaryPublicId(imageUrl);
        if (!publicId) return false;
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        return true;
    } catch (error) {
        console.warn("Cloudinary image cleanup skipped:", error.message || error);
        return false;
    }
};

export default cloudinary;
