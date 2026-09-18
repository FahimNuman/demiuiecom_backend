import express from "express";
import { addToCart } from "../controllers/cartController.js";
import { getCart } from "../controllers/cart/getCart.js";
import { updateCartItem } from "../controllers/cart/updateCartItem.js";
import {
  deleteCartItems,
  deleteSizeFromColor,
} from "../controllers/cart/deleteCartItem.js";
import { updateQuantityOfSize } from "../controllers/cart/updateQuantityOfSize.js";

const cartRouter = express.Router();

cartRouter.post("/add", addToCart); // Add item to cart
cartRouter.get("/:userId", getCart); // Get user's cart
cartRouter.put("/update", updateCartItem); // Update cart item
cartRouter.put("/:cartId", updateQuantityOfSize);
cartRouter.put("/item/delete", deleteCartItems);
cartRouter.put("/item/:cartId", deleteSizeFromColor);

export default cartRouter;
