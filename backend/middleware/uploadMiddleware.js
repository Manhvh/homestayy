import multer from "multer";
import path from "path";
import fs from "fs";
import {
    isCloudinaryConfigured,
    uploadBufferToCloudinary,
    deleteCloudinaryImage,
} from "../configs/cloudinary.js";

const uploadDir = "uploads";

// Strict whitelist of safe raster image MIME types & extensions (blocks SVG/HTML/JS XSS uploads)
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
]);

export const imageFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const mime = String(file.mimetype || "").toLowerCase();

    if (ALLOWED_IMAGE_MIME_TYPES.has(mime) && ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
        return cb(null, true);
    }

    const err = new Error("Định dạng tệp không hợp lệ. Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.");
    err.status = 400;
    err.code = "INVALID_FILE_TYPE";
    return cb(err);
};

// Use memoryStorage so buffers stream directly to Cloudinary (no ephemeral disk reliance on Render/Cloud)
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const getBackendBaseUrl = (req) =>
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `${req.protocol}://${req.get("host")}`;

export const getUploadedFileUrl = (req, filename) =>
    `${getBackendBaseUrl(req)}/uploads/${filename}`;

const saveBufferLocally = async (req, file) => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const targetPath = path.join(uploadDir, filename);
    await fs.promises.writeFile(targetPath, file.buffer);
    return getUploadedFileUrl(req, filename);
};

/**
 * Upload a single Multer memory file to Cloudinary (with automatic local fallback when Cloudinary secret is not set).
 */
export const uploadSingleImage = async (req, file, folder = "homestay/uploads") => {
    if (!file || !file.buffer) return "";

    if (isCloudinaryConfigured()) {
        const result = await uploadBufferToCloudinary(file.buffer, folder);
        return result.url;
    }

    return saveBufferLocally(req, file);
};

/**
 * Upload multiple Multer memory files in parallel to Cloudinary (or local fallback).
 */
export const uploadMultipleImages = async (req, files = [], folder = "homestay/uploads") => {
    if (!Array.isArray(files) || files.length === 0) return [];
    return Promise.all(files.map((file) => uploadSingleImage(req, file, folder)));
};

export { deleteCloudinaryImage };

export default upload;
