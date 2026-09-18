
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  },
  invoiceNumber: { type: String },
  customerName: { type: String },
  totalAmount: { type: String },
  orderDate: { type: Date, default: Date.now },
  email: { type: String },
  mobile: { type: String },
  postcode: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  paymentDetails: {
    method: {
      type: String,
      // required: true,
      enum: ["COD", "Credit Card", "PayPal", "Stripe", "AuthorizeNet"],
    },
    transactionId: { type: String },
  },
  trackingNumber: { type: String },
  assignerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false
    }
  ],
  pickerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false
  },
  status: {
    type: String,
    enum: ["pending", "processing", "assigned", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  orderProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orderProduct"
    }
  ],
});

// Pre-save hook to update updatedAt
orderSchema.pre("save", async function (next) {
  this.createdAt = Date.now();
  this.updatedAt = Date.now();
  next();
});


const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;

