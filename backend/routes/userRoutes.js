import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { getUserData, syncUserData, storeRecentSearchedCities, makeMeAdmin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/', protect, getUserData);
userRouter.post('/sync', protect, syncUserData);
userRouter.post('/store-recent-search', protect, storeRecentSearchedCities);
userRouter.post('/make-me-admin', protect, makeMeAdmin);

export default userRouter;