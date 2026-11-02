import express from "express";
import {
    getAllOffers,
    getOwnerOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
} from "../controllers/offerController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const offerRouter = express.Router();

offerRouter.get("/", getAllOffers);
offerRouter.get("/owner", protect, getOwnerOffers);
offerRouter.post("/", protect, upload.single("image"), createOffer);
offerRouter.put("/:id", protect, upload.single("image"), updateOffer);
offerRouter.delete("/:id", protect, deleteOffer);
offerRouter.post("/toggle-status", protect, toggleOfferStatus);

export default offerRouter;
