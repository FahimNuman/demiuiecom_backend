import cartModel from "../models/cartModel.js";
import { getTotalPrice } from "./getTotalPrice.js";

/**
 * Validate carts and combine items
 * @param {Array} cartIds - Array of cart IDs
 * @param {String} userId - User ID
 * @returns {Object} - { items, total, validCarts }
 */
export const validateAndCalculateCarts = async (cartIds, userId) => {
  try {
    const carts = await cartModel.find({
      _id: { $in: cartIds },
      user: userId,
    });

    if (!carts || carts.length === 0) {
      throw new Error("No valid carts found");
    }
    // console.log("carts:", carts[0].items);

    // Combine items from all carts
    const items = carts.flatMap((cart) => cart.items);

    // console.log("items:", items);
    // Calculate total price
    const total = Array.isArray(items)
      ? items.reduce((sum, item) => sum + item.total, 0)
      : 0;

    console.log("total:", total);

    return { items, total, validCarts: carts };
  } catch (error) {
    // throw new Error(error.message);
    console.log("Error validating carts:", error);
  }
};


