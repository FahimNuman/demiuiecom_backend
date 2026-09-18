import orderModel from "../../models/orderModel.js";
import cartModel from "../../models/cartModel.js";

export const createOrder = async (req, res) => {
  const { userId, cartIds, address } = req.body;

  try {
    const carts = await cartModel
      .find({
        _id: { $in: cartIds },
        user: userId,
      })
      .populate([
        {
          path: "items.product",
          select: "name images",
          populate: { path: "images", select: "url title" },
        },
        { path: "items.color", select: "name color_id" },
        { path: "items.sizes.size", select: "name size_id" },
      ]);

    if (!carts || carts.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid carts found" });
    }

    // Combine items from all selected carts
    const allItems = carts.flatMap((cart) => cart.items);

    const total = allItems.reduce(
      (sum, item) =>
        sum +
        item.sizes.reduce((subtotal, size) => subtotal + size.subtotal, 0),
      0
    );

    const newOrder = new orderModel({
      user: userId,
      items: allItems,
      total,
      address,
      status: "pending",
    });

    await newOrder.save();

    // Remove selected carts
    await cartModel.deleteMany({ _id: { $in: cartIds } });

    res
      .status(201)
      .json({
        success: true,
        message: "Order placed successfully",
        order: newOrder,
      });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


