import express from "express";
import {
    checkAvailabilityAPI,
    getRoomBookedDates,
    createBookings,
    getHotelBookings,
    getUserBookings,
    updateBookingStatus,
    markBookingRefunded,
    cancelUserBooking,
    sendBookingMail,
} from "../controllers/bookingController.js";
import { protect, ownerProtect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.get("/room/:roomId/booked-dates", getRoomBookedDates);
bookingRouter.post("/book", protect, createBookings);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, ownerProtect, getHotelBookings);
bookingRouter.put("/:id/status", protect, ownerProtect, updateBookingStatus);
bookingRouter.put("/:id/refund", protect, ownerProtect, markBookingRefunded);
bookingRouter.post("/:id/send-mail", protect, ownerProtect, sendBookingMail);
bookingRouter.put("/:id/cancel", protect, cancelUserBooking);

export default bookingRouter;
