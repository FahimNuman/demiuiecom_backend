// /config/stripeConfig.js

import Stripe from "stripe";

let stripeInstance = null; // Prevent early execution

// Function to initialize Stripe
export const initializeStripe = (secretKey) => {
  if (!secretKey) {
    throw new Error("Stripe secret key is missing! Cannot initialize Stripe.");
  }
  stripeInstance = new Stripe(secretKey);
  console.log("✅ Stripe initialized dynamically.");
};

// Function to get Stripe instance
export const getStripe = () => {
  if (!stripeInstance) {
    throw new Error("Stripe has not been initialized. Call initializeStripe first.");
  }
  return stripeInstance;
};
