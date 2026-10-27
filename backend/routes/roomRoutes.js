import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
    createRoom,
    getOwnerRooms,
    getRooms,
    toggleRoomAvailability,
    updateRoom,
    deleteRoom,
} from "../controllers/roomController.js";

const roomRouter = express.Router();

roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
roomRouter.post("/", upload.array("images", 4), protect, createRoom);
roomRouter.put("/:id", protect, updateRoom);
roomRouter.delete("/:id", protect, deleteRoom);
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);

export default roomRouter;
