import express from "express";
import {
    checkAvailabilityAPI,
    createBookings,
    getHotelBookings,
    getUserBookings,
    updateBookingStatus,
    cancelUserBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBookings);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);
bookingRouter.put("/:id/status", protect, updateBookingStatus);
bookingRouter.put("/:id/cancel", protect, cancelUserBooking);

export default bookingRouter;
