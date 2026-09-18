import colorModel from "../../models/colorModel.js";
import orderModel from "../../models/orderModel.js";
import orderProductModel from "../../models/OrderProductModel.js";


export const getUserOrders = async (req, res) => {
  const { userId } = req.params;



  try {

    const orders = await orderModel.find({ user: userId })
      .populate({
        path: 'orderProducts',
        model: 'orderProduct',
        populate: [
          { path: 'productId', model: 'product' },
          { path: 'colorId', model: 'color' },
          { path: 'sizeId', model: 'size' }
        ]
      });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, orders: orders });
  } catch (error) {
    console.error("Error fetching user orders test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrdersOld = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await orderModel.find({ user: userId }).populate([
      {
        path: "carts",
        populate: {
          path: "items",
          populate: {
            path: "product_id",
            model: "product",
            select: "name sku brand_name style_id",
          },
        },
      },
    ]);

    const prepareOrders = orders.map((order) => {
      return {
        _id: order._id,
        user: order.user,
        total: order.total,
        status: order.status,
        paymentDetails: order.paymentDetails,
        address: order.address,
        items: order.carts[0].items.map((item) => {
          return {
            product_id: item.product_id?._id,
            product_name: item.product_id?.name,
            product_sku: item.product_id?.sku,
            product_brand_name: item.product_id?.brand_name,
            product_style_id: item.product_id?.style_id,
            total: item.total,
            colors: item.colors,
          };
        }),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, orders: prepareOrders });
  } catch (error) {
    console.error("Error fetching user orders test:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
