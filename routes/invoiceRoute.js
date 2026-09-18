import express from "express";
import {
  getInvoices
} from "../controllers/invoiceController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const invoiceRouter = express.Router();

// Route for listing all products
invoiceRouter.get("/list", getInvoices);

export default invoiceRouter;
