import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { syncDatabase } from './models/index.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import adminRouter from './routes/adminRoutes.js';

// Connect to MySQL and synchronize tables
const initServer = async () => {
    await connectDB();
    await syncDatabase();
};
initServer();

const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Serve uploaded images statically
app.use('/uploads', express.static('uploads'));

// Parse JSON request bodies
app.use(express.json());

app.get('/', (req, res) => res.send('HomeStay API (MySQL) is working....!'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server is running at localhost:${PORT}`));
