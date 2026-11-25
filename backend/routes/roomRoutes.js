import express from "express";
import { protect, optionalProtect, ownerProtect } from "../middleware/authMiddleware.js";
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
roomRouter.get("/owner", protect, ownerProtect, getOwnerRooms);
roomRouter.get("/:id", optionalProtect, getRoomById);
roomRouter.post("/", protect, ownerProtect, upload.array("images", 4), createRoom);
roomRouter.put("/:id", protect, ownerProtect, upload.array("images", 4), updateRoom);
roomRouter.delete("/:id", protect, ownerProtect, deleteRoom);
roomRouter.post("/toggle-availability", protect, ownerProtect, toggleRoomAvailability);

export default roomRouter;
