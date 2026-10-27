import express from "express";
import { protect, adminProtect } from "../middleware/authMiddleware.js";
import {
    getAllUsers,
    updateUserRole,
    toggleUserBlock,
    getAllHotels,
    updateHotelStatus,
    getAdminStats,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.use(protect, adminProtect);

adminRouter.get("/stats", getAdminStats);
adminRouter.get("/users", getAllUsers);
adminRouter.put("/users/:id/role", updateUserRole);
adminRouter.put("/users/:id/status", toggleUserBlock);

adminRouter.get("/hotels", getAllHotels);
adminRouter.put("/hotels/:id/status", updateHotelStatus);

export default adminRouter;
