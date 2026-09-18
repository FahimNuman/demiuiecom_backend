import express from "express";
import { getAuthorizeNetKeys, updateAuthorizeNetKeys, processPayment, processPaymentAndCreateOrder, createTransaction } from "../controllers/authorizeNetController.js";

const authorizeNetRouter = express.Router();

// Routes for managing Authorize.Net API keys
authorizeNetRouter.get("/keys", getAuthorizeNetKeys);
authorizeNetRouter.post("/keys", updateAuthorizeNetKeys);

// Routes for processing payments
authorizeNetRouter.post("/process-payment", processPayment);
authorizeNetRouter.post("/process-payment-and-create-order", processPaymentAndCreateOrder);
authorizeNetRouter.post("/create-transaction", createTransaction);

export default authorizeNetRouter;
