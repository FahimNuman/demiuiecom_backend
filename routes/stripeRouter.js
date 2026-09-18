import express from "express";

import orderModel from "../models/orderModel.js";
import { getStripe } from "../config/stripeConfig.js";

const stripeRouter = express.Router();

stripeRouter.post("/create-payment-intent", async (req, res) => {
  try {
    const stripe = getStripe(); // ✅ Get Stripe dynamically

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Unable to create payment intent" });
  }
});

stripeRouter.post("/confirm-payment", async (req, res) => {
  const { paymentIntentId, orderDetails } = req.body;

  if (!paymentIntentId || !orderDetails) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const order = new orderModel({
        ...orderDetails,
        paymentDetails: {
          method: "Stripe",
          paymentIntentId: paymentIntent.id,
        },
        status: "processing",
      });

      await order.save();
      res.status(200).json({ success: true, order });
    } else {
      res.status(400).json({ success: false, message: "Payment not succeeded" });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Unable to confirm payment" });
  }
});

export default stripeRouter;