import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import { registerHotel, getMyHotel, updateMyHotel } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post('/', protect, upload.single("image"), registerHotel);
hotelRouter.get('/my-hotel', protect, getMyHotel);
hotelRouter.put('/my-hotel', protect, upload.single("image"), updateMyHotel);

export default hotelRouter;
