import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import connectDB from './configs/db.js';
import { syncDatabase, User } from './models/index.js';
import { verifyMailer } from './configs/nodemailer.js';
import { verifyCloudinary, isCloudinaryConfigured } from './configs/cloudinary.js';
import { seedDatabase } from './database/seeder.js';
import { expireStaleVnpayBookings } from './controllers/bookingController.js';
import swaggerSpec from './docs/swaggerSpec.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';

const app = express();
app.set('trust proxy', 1);

// Security HTTP headers (allow cross-origin images from /uploads and Swagger UI assets)
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    })
);

app.use(
    cors({
        origin: process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
            : '*',
        credentials: true,
    })
);

// Rate limiting on sensitive authentication & OTP endpoints (relaxed in test environment)
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 1000 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau ít phút.',
    },
});

// Serve uploaded images statically with defense-in-depth anti-XSS headers
app.use(
    '/uploads',
    express.static('uploads', {
        setHeaders: (res) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
        },
    })
);

// Parse JSON request bodies
app.use(express.json({ limit: '2mb' }));

// Swagger / OpenAPI Documentation
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'HomeStay API Docs' }));

app.get('/', (req, res) => res.send('HomeStay API (MySQL) is working....! Xem tài liệu API tại /api-docs'));
app.get('/api/health', (req, res) =>
    res.json({
        status: 'ok',
        storage: isCloudinaryConfigured() ? 'cloudinary' : 'local',
        timestamp: new Date().toISOString(),
    })
);

app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/send-verify-code', authRateLimiter);
app.use('/api/auth/forgot-password', authRateLimiter);
app.use('/api/auth/reset-password', authRateLimiter);

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentRouter);

// 404 Not Found handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Không tìm thấy đường dẫn API: ${req.method} ${req.originalUrl}`,
    });
});

// Global error handler (including Multer / JSON parsing errors)
app.use((err, req, res, _next) => {
    console.error('Unhandled API Error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'Kích thước tệp tải lên vượt quá giới hạn cho phép (10MB).',
        });
    }
    if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            success: false,
            message: err.message || 'Định dạng tệp không hợp lệ.',
        });
    }
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi máy chủ nội bộ.',
    });
});

// Connect to MySQL, synchronize tables, auto-seed if empty, and verify Nodemailer SMTP connection
export const initServer = async () => {
    await connectDB();
    await syncDatabase();
    if (process.env.AUTO_SEED === 'true') {
        try {
            const count = await User.count();
            if (count === 0) {
                console.log('Database is empty, running initial seed...');
                await seedDatabase();
            }
        } catch (seedErr) {
            console.warn('Auto seed skipped:', seedErr.message);
        }
    }
    await expireStaleVnpayBookings();
    await verifyCloudinary();
    await verifyMailer();
};

const isDirectRun =
    process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
    initServer();
    // Periodically expire abandoned unpaid VNPay bookings every 5 minutes
    const cleanupTimer = setInterval(() => {
        expireStaleVnpayBookings();
    }, 5 * 60 * 1000);
    cleanupTimer.unref();

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server is running at localhost:${PORT} (API Docs: http://localhost:${PORT}/api-docs)`));
}

export default app;
