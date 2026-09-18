import { validateAndCalculateCarts } from "../../helpers/orderHelpers.js";
import cartModel from "../../models/cartModel.js";
import orderModel from "../../models/orderModelOld.js";
import orderProductModel from "../../models/OrderProductModel.js";


// ------------------------------- Create Order -------------------------------



// export const placeOrderOld = async (req, res) => {
//   const { userId, cartIds, address, paymentDetails } = req.body;

//   try {
//     // Validate and recalculate totals to prevent tampering
//     const { items: carts, total } = await validateAndCalculateCarts(
//       cartIds,
//       userId
//     );

//     // Create the order
//     const newOrder = new orderModel({
//       user: userId,
//       carts: { user: carts.user, items: carts },
//       total,
//       address,
//       paymentDetails: paymentDetails || {},
//       status: "pending",
//     });

//     console.log("items:", carts);

//     await newOrder.save();

//     // Remove selected carts
//     await cartModel.deleteMany({ _id: { $in: cartIds } });

//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       order: newOrder,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const generateInvoiceNumber = () => {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000) // between 100000–999999
  return `INV-${randomSixDigits}`
}


export const placeOrder = async (req, res) => {
  const { userId, cartIds, address, paymentDetails, deliveryInfo } = req.body;

  try {
    // Step 1: Validate and recalculate cart
    const { items: carts, total } = await validateAndCalculateCarts(cartIds, userId);

    if (!carts || carts.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty or invalid." });
    }

    const orderInfo = carts[0];
    const productId = orderInfo?.product_id;
    const totalAmount = total || 0;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Invalid product data." });
    }

    const invoiceNumber = generateInvoiceNumber();

    // Step 2: Create main order
    const order = new orderModel({
      user: userId,
      productId,
      invoiceNumber,
      customerName: deliveryInfo?.customerName || "",
      totalAmount,
      email: deliveryInfo?.email || "",
      mobile: deliveryInfo?.mobile || "",
      postcode: deliveryInfo?.postcode || "",
      address: deliveryInfo?.address || address || "",
      paymentDetails: paymentDetails || {},
      status: "pending",
    });

    const newOrder = await order.save();
    const orderId = newOrder._id;

    // Step 3: Prepare order products
    const orderProductsData = [];

    for (const color of orderInfo.colors || []) {
      const colorId = color.color_id;

      for (const size of color.sizes || []) {
        orderProductsData.push({
          orderId,
          productId,
          colorId,
          sizeId: size.size_id,
          quantity: size.quantity,
          price: size.price,
        });
      }
    }

    // Step 4: Save all order products and link to order
    let insertedOrderProducts = [];
    if (orderProductsData.length > 0) {
      insertedOrderProducts = await orderProductModel.insertMany(orderProductsData);

      const orderProductIds = insertedOrderProducts.map(op => op._id);

      // Add orderProducts to order
      await orderModel.findByIdAndUpdate(orderId, {
        $set: { orderProducts: orderProductIds }
      });
    }

    // Step 5: Remove items from cart
    await cartModel.deleteMany({ _id: { $in: cartIds } });

    // Step 6: Optionally fetch full populated order
    const populatedOrder = await orderModel.findById(orderId).populate({
      path: 'orderProducts',
      populate: [
        { path: 'productId' },
        { path: 'colorId' }
      ]
    });

    // Step 7: Send response
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder, // full order with populated products
      orderItems: insertedOrderProducts,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};



export const placeOrder_ = async (req, res) => {
  const { userId, cartIds, address, paymentDetails, deliveryInfo } = req.body;

  try {
    // Step 1: Validate and recalculate cart
    const { items: carts, total } = await validateAndCalculateCarts(cartIds, userId);

    if (!carts || carts.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty or invalid." });
    }

    const orderInfo = carts[0];
    const productId = orderInfo?.product_id;
    const totalAmount = carts && carts[0]?.total || 0;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Invalid product data." });
    }

    const invoiceNumber = generateInvoiceNumber();


    // Step 2: Create main order
    const order = new orderModel({
      user: userId,
      productId,
      invoiceNumber,
      customerName: deliveryInfo?.customerName || "",
      totalAmount: total, // Use recalculated total
      email: deliveryInfo?.email || "",
      mobile: deliveryInfo?.mobile || "",
      postcode: deliveryInfo?.postcode || "",
      address: deliveryInfo?.address || address || "",
      paymentDetails: paymentDetails || {},
      status: "pending",
    });

    // console.log("order:", order);
    // process.exit();

    const newOrder = await order.save();
    const orderId = newOrder._id;

    // Step 3: Prepare order products
    const orderProductsData = [];

    for (const color of orderInfo.colors || []) {
      const colorId = color.color_id;

      for (const size of color.sizes || []) {
        orderProductsData.push({
          orderId,
          productId,
          colorId,
          sizeId: size.size_id,
          quantity: size.quantity,
          price: size.price,
        });
      }
    }

    // Step 4: Save all order products
    if (orderProductsData.length > 0) {
      await orderProductModel.insertMany(orderProductsData);
    }

    // Step 5: Remove items from cart
    await cartModel.deleteMany({ _id: { $in: cartIds } });

    // Step 6: Send response
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
      orderItems: orderProductsData,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};


