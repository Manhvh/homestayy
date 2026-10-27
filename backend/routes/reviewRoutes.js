import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createReview, getHotelReviews, getReviewStats, deleteReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/hotel/:hotelId", getHotelReviews);
reviewRouter.get("/stats", getReviewStats);
reviewRouter.post("/", protect, createReview);
reviewRouter.delete("/:id", protect, deleteReview);

export default reviewRouter;
