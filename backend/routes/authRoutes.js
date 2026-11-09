import express from 'express';
import { register, login, getMe, sendVerifyCode, sendResetCode, resetPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/send-verify-code', sendVerifyCode);
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', sendResetCode);
authRouter.post('/reset-password', resetPassword);
authRouter.put('/change-password', protect, changePassword);
authRouter.get('/me', protect, getMe);

export default authRouter;
