import express from "express";
import { insertOrUpdateEmail, getSetting, verifyOtp, verifyPin, forgotpin } from "../controllers/setting/settingController.js";
import adminAuth from "../middleware/adminAuth.js";

const settingRouter = express.Router();

// Route for listing all products
settingRouter.get("/", getSetting);
settingRouter.post("/email", insertOrUpdateEmail);
settingRouter.post("/otpVerify", verifyOtp);
settingRouter.post("/pinVerify", verifyPin);
settingRouter.post("/forgotpin", forgotpin);

export default settingRouter;