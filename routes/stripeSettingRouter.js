import express from "express";
import { getStripeKeys, updateStripeKeys } from "../controllers/stripeController.js";

const stripeSettingRouter = express.Router();

stripeSettingRouter.get("/keys", getStripeKeys);
stripeSettingRouter.post("/keys", updateStripeKeys);

export default stripeSettingRouter;
