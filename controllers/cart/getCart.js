import cartModel from "../../models/cartModel.js";

export const getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the cart and populate the required fields
    const carts = await cartModel
      .find({ user: userId })
      .populate([
        {
          path: "items.product_id",
          select: "name images",
          populate: { path: "images", select: "url title" },
        },
        { path: "items.colors.color_id", select: "name color_id" },
        { path: "items.colors.sizes.size_id", select: "name size_id" },
      ])
      .lean(); // Use `.lean()` to convert to plain JavaScript objects

    // Restructure the cart data
    const formattedCarts = carts.map((cart) => ({
      _id: cart._id,
      user: cart.user,
      items: cart.items.map((item) => ({
        product_id: item.product_id?._id,
        product_name: item.product_id?.name,
        product_images: item.product_id?.images,
        total: item.total,
        colors: item.colors.map((color) => ({
          color_id: color.color_id?._id,
          color_name: color.color_id?.name,
          color_code: color.color_id?.color_id,
          sizes: color.sizes.map((size) => ({
            size_id: size.size_id?._id,
            size_name: size.size_id?.name,
            size_code: size.size_id?.size_id,
            quantity: size.quantity,
            price: size.price,
            subtotal: size.subtotal,
          })),
        })),
      })),
    }));

    res.status(200).json({ success: true, carts: formattedCarts });
  } catch (error) {
    console.error("Error fetching user carts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
