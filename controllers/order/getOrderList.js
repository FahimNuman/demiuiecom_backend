import orderModel from "../../models/orderModel.js";


export const getOrderList = async (req, res) => {
  try {
    const status = req.query.status;



    const filter = status ? { status } : {};

    console.log("status", status);
    if (status === 'all') {
      const orders = await orderModel.find().populate([
        {
          path: 'orderProducts',
          model: 'orderProduct',
          populate: [
            { path: 'productId', model: 'product' },
            { path: 'colorId', model: 'color' },
            { path: 'sizeId', model: 'size' }
          ]
        },
        {
          path: 'productId',
          model: 'product'
        }
      ]);

      res.status(200).json({
        success: true,
        message: "Order list fetched successfully",
        orders,
      });
    } else {
      const orders = await orderModel.find(filter).populate([
        {
          path: 'orderProducts',
          model: 'orderProduct',
          populate: [
            { path: 'productId', model: 'product' },
            { path: 'colorId', model: 'color' },
            { path: 'sizeId', model: 'size' }
          ]
        },
        {
          path: 'productId',
          model: 'product'
        }
      ]);

      res.status(200).json({
        success: true,
        message: "Order list fetched successfully",
        orders,
      });
    }


  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order list",
      error: error.message,
    });
  }
};


export const getOrderListOld = async (req, res) => {
  try {
    const status = 'pending';

    const orders = await orderModel.find({ status: status }).populate([
      {
        path: 'orderProducts',
        model: 'orderProduct',
        populate: [
          { path: 'productId', model: 'product' },
          { path: 'colorId', model: 'color' },
          { path: 'sizeId', model: 'size' }
        ]
      },
      {
        path: 'productId',
        model: 'product'
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Order list fetched successfully",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order list",
      error: error.message,
    });
  }
};
