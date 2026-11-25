import express from "express";
import { protect, adminProtect } from "../middleware/authMiddleware.js";
import { getCategories, addCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", protect, adminProtect, addCategory);
categoryRouter.put("/:id", protect, adminProtect, updateCategory);
categoryRouter.delete("/:id", protect, adminProtect, deleteCategory);

export default categoryRouter;
