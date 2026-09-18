import express from "express";
import {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addSubCategory,
  updateSubCategory,
} from "../controllers/categoryController.js";
import upload from "../middleware/multer.js";

const categoryRouter = express.Router();

categoryRouter.post("/add", upload.single("image"), createCategory);

categoryRouter.post(
  "/addsdd",
  upload.any(), // Allows uploading files with any field name
  createCategory
);

// categoryRouter.post("/adds", createCategory);

categoryRouter.get("/list", listCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.post("/:id/subcategory", addSubCategory);
categoryRouter.put("/:id/subcategory/:subCategoryId", updateSubCategory);

export default categoryRouter;
