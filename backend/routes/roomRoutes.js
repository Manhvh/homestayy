import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
    createRoom,
    getOwnerRooms,
    getRooms,
    getRoomById,
    toggleRoomAvailability,
    updateRoom,
    deleteRoom,
} from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
roomRouter.get("/:id", getRoomById);
roomRouter.post("/", protect, upload.array("images", 4), createRoom);
roomRouter.put("/:id", protect, upload.array("images", 4), updateRoom);
roomRouter.delete("/:id", protect, deleteRoom);
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);

export default roomRouter;
