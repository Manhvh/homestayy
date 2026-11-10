import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure local uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Local disk storage for uploaded room/hotel/avatar images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const getBackendBaseUrl = (req) =>
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `${req.protocol}://${req.get("host")}`;

export const getUploadedFileUrl = (req, filename) =>
    `${getBackendBaseUrl(req)}/uploads/${filename}`;

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default upload;
