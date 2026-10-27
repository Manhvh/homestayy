import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { registerHotel, getMyHotel, updateMyHotel } from "../controllers/hotelController.js";

const hotelRouter = express.Router();

hotelRouter.post('/', protect, registerHotel);
hotelRouter.get('/my-hotel', protect, getMyHotel);
hotelRouter.put('/my-hotel', protect, updateMyHotel);

export default hotelRouter;
