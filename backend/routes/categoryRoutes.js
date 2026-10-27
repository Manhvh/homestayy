import express from "express";
import { protect, adminProtect } from "../middleware/authMiddleware.js";
import { getCategories, addCategory, deleteCategory } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", protect, adminProtect, addCategory);
categoryRouter.delete("/:id", protect, adminProtect, deleteCategory);

export default categoryRouter;
