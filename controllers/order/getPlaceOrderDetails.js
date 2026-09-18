import { validateAndCalculateCarts } from "../../helpers/orderHelpers.js";

export const getPlaceOrderDetails = async (req, res) => {
  const { userId, cartIds } = req.body;

  try {
    const { items, total, validCarts } = await validateAndCalculateCarts(
      cartIds,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      orderDetails: {
        items,
        total,
        cartIds: validCarts.map((cart) => cart._id),
      },
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
