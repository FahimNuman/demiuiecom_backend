import express from "express";
import multer from "multer";
import { getList, uploadExcel } from "../controllers/excelController.js";

const excelRouter = express.Router();

// Multer setup for file uploads
// const upload = multer({ dest: "uploads/" });

// Define the route for uploading Excel files
// excelRouter.post("/upload", upload.single("file"), uploadExcel);

excelRouter.post("/upload", uploadExcel);
excelRouter.get('/list', getList);

export default excelRouter;
