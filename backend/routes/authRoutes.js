import express from 'express';
import { register, login, getMe, sendVerifyCode } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/send-verify-code', sendVerifyCode);
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', protect, getMe);

export default authRouter;
