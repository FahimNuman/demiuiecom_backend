import express from "express";
import {
  addColor,
  listColors,
  getColorById,
  updateColor,
  deleteColor,
} from "../controllers/colorController.js";
// import adminAuth from "../middleware/adminAuth.js";

const colorRouter = express.Router();
colorRouter.post("/add",addColor);
colorRouter.get("/list", listColors);
colorRouter.get("/:id", getColorById);
colorRouter.put("/:id", updateColor);
colorRouter.delete("/:id", deleteColor);

export default colorRouter;
