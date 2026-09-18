import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "size",
    required: true,
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }, // quantity * price
});

const colorSchema = new mongoose.Schema({
  color_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "color",
    required: true,
  },
  sizes: { type: [sizeSchema], required: true },
});

const cartItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  total: { type: Number, required: true }, // Sum of all subtotals
  colors: { type: [colorSchema], required: true },
});

export const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: { type: [cartItemSchema], required: true },
});

const cartModel = mongoose.models.cart || mongoose.model("cart", cartSchema);

export default cartModel;
