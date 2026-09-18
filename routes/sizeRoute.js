import express from "express";
import { addSize, listSizes, getSizeById, updateSize, deleteSize } from "../controllers/sizeController.js";


const sizeRouter = express.Router();
sizeRouter.post("/add",  addSize);
sizeRouter.get("/list", listSizes);
sizeRouter.get("/:id", getSizeById);
sizeRouter.put("/:id", updateSize);
sizeRouter.delete("/:id",  deleteSize);

export default sizeRouter;
