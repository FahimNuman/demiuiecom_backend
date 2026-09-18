import { getTotalPrice } from "../../helpers/getTotalPrice.js";
import cartModel from "../../models/cartModel.js";

export const updateQuantityOfSize = async (req, res) => {
  const { cartId } = req.params;
  const { userId, colorId, sizeId, quantity } = req.body;

  try {
    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Find the cart
    const cart = await cartModel.findOne({ _id: cartId, user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Find the relevant cart item and color
    const cartItem = cart.items.find((item) =>
      item.colors.some((color) => color.color_id.toString() === colorId)
    );

    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found in cart item" });
    }

    const color = cartItem.colors.find(
      (color) => color.color_id.toString() === colorId
    );

    const size = color.sizes.find((size) => size.size_id.toString() === sizeId);

    if (!size) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found in color" });
    }

    // Update the quantity and subtotal for the size
    size.quantity = quantity;
    size.subtotal = size.price * quantity;

    // Recalculate the total price of the cart
    cartItem.total = getTotalPrice(cart);

    // Save the updated cart
    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Quantity updated successfully", cart });
  } catch (error) {
    console.error("Error updating size quantity:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
