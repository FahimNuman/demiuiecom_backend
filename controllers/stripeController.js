// /controllers/stripeController.js

import dotenv from "dotenv";
import Stripe from "../models/stripeModel.js";  // This is the model for Stripe keys
import { initializeStripe } from "../config/stripeConfig.js"; // Correct path to stripeConfig

// Load env variables initially
dotenv.config();

export const getStripeKeys = async (req, res) => {
  try {
    const keys = await Stripe.findOne();
    if (!keys) {
      return res.status(404).json({ message: "Stripe keys not found" });
    }
    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStripeKeys = async (req, res) => {
  try {
    const { publicKey, secretKey } = req.body;
    let keys = await Stripe.findOne();

    if (keys) {
      keys.publicKey = publicKey || keys.publicKey;
      keys.secretKey = secretKey || keys.secretKey;
    } else {
      keys = new Stripe({ publicKey, secretKey });
    }

    await keys.save();

    // Update environment variables after saving new keys
    process.env.STRIPE_PUBLIC_KEY = keys.publicKey;
    process.env.STRIPE_SECRET_KEY = keys.secretKey;

    res.json({ message: "Stripe keys updated successfully", keys });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Load Stripe Keys to Environment Variables at Server Startup
export const loadStripeKeysToEnv = async () => {
  try {
    const keys = await Stripe.findOne();
    if (keys) {
      process.env.STRIPE_PUBLIC_KEY = keys.publicKey;
      process.env.STRIPE_SECRET_KEY = keys.secretKey;
      initializeStripe(keys.secretKey); // ✅ Initialize Stripe after fetching keys
      console.log("✅ Stripe keys loaded dynamically.");
    } else {
      console.warn("⚠️ Stripe keys not found in database.");
    }
  } catch (error) {
    console.error("❌ Error loading Stripe keys:", error);
  }
};
