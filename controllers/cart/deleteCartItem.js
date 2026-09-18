import { getTotalPrice } from "../../helpers/getTotalPrice.js";
import cartModel from "../../models/cartModel.js";

export const deleteCartItems = async (req, res) => {
  const { userId, cartIds } = req.body;

  try {
    const result = await cartModel.deleteMany({
      _id: { $in: cartIds },
      user: userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching carts found for deletion",
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} cart(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting carts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSizeFromColor = async (req, res) => {
  const { cartId } = req.params;
  const { userId, colorId, sizeId } = req.body;

  try {
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

    // Check if the size exists within the color
    const sizeExists = color.sizes.some(
      (size) => size.size_id.toString() === sizeId
    );
    if (!sizeExists) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found in color" });
    }

    // Filter out the size
    color.sizes = color.sizes.filter(
      (size) => size.size_id.toString() !== sizeId
    );

    // If no sizes are left, remove the color
    if (color.sizes.length === 0) {
      cartItem.colors = cartItem.colors.filter(
        (color) => color.color_id.toString() !== colorId
      );
    }

    // If no colors are left, remove the cart item
    if (cartItem.colors.length === 0) {
      cart.items = cart.items.filter((item) => item !== cartItem);
    }

    cartItem.total = getTotalPrice(cart);

    // Save the updated cart
    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Size removed successfully" });
  } catch (error) {
    console.error("Error deleting size from color:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
