import cartModel from "../../models/cartModel.js";
import productModel from "../../models/productModel.js";

export const addToCart = async (req, res) => {
  const { userId, productId, colorId, sizes } = req.body;

  try {
    const product = await productModel.findById(productId).populate([
      {
        path: "colors._id",
        select: "_id name color_id",
      },
      {
        path: "colors.sizes.size",
        model: "size",
        select: "_id name size_id",
      },
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Calculate subtotals for sizes
    const sizeDetails = sizes.map((sizeEntry) => {
      const size = product.colors
        .find((color) => color._id._id.toString() === colorId)
        .sizes.find((s) => s.size._id.toString() === sizeEntry.size);

      if (!size) {
        throw new Error(
          `Size ${sizeEntry.size} not found for the selected color`
        );
      }

      return {
        size: size.size._id,
        quantity: sizeEntry.quantity,
        price: sizeEntry.price,
        subtotal: sizeEntry.quantity * sizeEntry.price,
      };
    });

    // Calculate total
    const total = sizeDetails.reduce((sum, item) => sum + item.subtotal, 0);

    // Check if the user already has a cart
    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
      cart = new cartModel({ user: userId, items: [] });
    }

    // Add or update item in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color.toString() === colorId
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].sizes = sizeDetails;
    } else {
      cart.items.push({
        product: productId,
        color: colorId,
        sizes: sizeDetails,
      });
    }

    // Update total
    cart.total = cart.items.reduce(
      (sum, item) =>
        sum +
        item.sizes.reduce((subtotal, size) => subtotal + size.subtotal, 0),
      0
    );

    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
