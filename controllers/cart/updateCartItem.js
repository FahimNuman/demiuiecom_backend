import cartModel from "../../models/cartModel.js";

export const updateCartItem = async (req, res) => {
  const { userId, productId, colorId, sizes } = req.body;

  try {
    // Find the cart for the user
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Locate the specific product in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    // Locate the specific color in the product
    const colorIndex = cart.items[itemIndex].colors.findIndex(
      (color) => color.color_id.toString() === colorId
    );

    if (colorIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found for this item" });
    }

    // Update sizes for the color
    const updatedSizes = sizes.map((sizeEntry) => ({
      size_id: sizeEntry.size_id,
      quantity: sizeEntry.quantity,
    }));

    cart.items[itemIndex].colors[colorIndex].sizes = updatedSizes;

    // Recalculate the total for the color
    const colorTotal = updatedSizes.reduce(
      (total, size) => total + size.quantity,
      0
    );

    cart.items[itemIndex].total = cart.items[itemIndex].colors.reduce(
      (colorSum, color) =>
        colorSum +
        color.sizes.reduce((sizeSum, size) => sizeSum + size.quantity, 0),
      0
    );

    // Save the updated cart
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
