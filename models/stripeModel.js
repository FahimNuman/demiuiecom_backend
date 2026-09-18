import mongoose from "mongoose";

const StripeSchema = new mongoose.Schema({
  publicKey: { type: String },
  secretKey: { type: String },
}, { timestamps: true });

export default mongoose.model("Stripe", StripeSchema);