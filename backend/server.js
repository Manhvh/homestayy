import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { syncDatabase, User } from './models/index.js';
import { verifyMailer } from './configs/nodemailer.js';
import { seedDatabase } from './database/seeder.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import offerRouter from './routes/offerRoutes.js';

// Connect to MySQL, synchronize tables, auto-seed if empty, and verify Nodemailer SMTP connection
const initServer = async () => {
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
    await verifyMailer();
};
initServer();

const app = express();
app.set('trust proxy', 1);
app.use(
    cors({
        origin: process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.split(',').map((u) => u.trim())
            : '*',
        credentials: true,
    })
); // Enable Cross-Origin Resource Sharing

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Parse JSON request bodies
app.use(express.json());

app.get('/', (req, res) => res.send('HomeStay API (MySQL) is working....!'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/offers', offerRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running at localhost:${PORT}`));
