import express from "express";
import {
  registerVendor,
  listVendors,
  getVendorDetails,
} from "../controllers/vendorController.js";

const vendorRouter = express.Router();

vendorRouter.post("/register", registerVendor);
vendorRouter.get("/list", listVendors);
// Use a dynamic URL parameter for vendor ID
vendorRouter.get("/:vendorId", getVendorDetails);

export default vendorRouter;