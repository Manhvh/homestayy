import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { getUserData, syncUserData, storeRecentSearchedCities, updateUserProfile } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/', protect, getUserData);
userRouter.post('/sync', protect, syncUserData);
userRouter.post('/store-recent-search', protect, storeRecentSearchedCities);
userRouter.put('/profile', protect, upload.single('image'), updateUserProfile);

export default userRouter;