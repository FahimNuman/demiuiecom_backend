import orderModel from "../../models/orderModel.js";

export const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await orderModel
      .findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .populate("items.color", "name color_id")
      .populate("items.sizes.size", "name size_id");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
