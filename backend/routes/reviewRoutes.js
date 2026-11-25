import express from "express";
import { protect, ownerProtect, adminProtect } from "../middleware/authMiddleware.js";
import {
    createReview,
    getHotelReviews,
    getOwnerReviews,
    getPublicReviewHighlights,
    getReviewStats,
    replyReview,
    deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/highlights", getPublicReviewHighlights);
reviewRouter.get("/hotel/:hotelId", getHotelReviews);
reviewRouter.get("/owner", protect, ownerProtect, getOwnerReviews);
reviewRouter.get("/stats", protect, adminProtect, getReviewStats);
reviewRouter.post("/", protect, createReview);
reviewRouter.put("/:id/reply", protect, ownerProtect, replyReview);
reviewRouter.delete("/:id", protect, deleteReview);

export default reviewRouter;
