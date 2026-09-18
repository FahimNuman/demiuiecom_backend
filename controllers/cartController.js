import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";


export const addToCart = async (req, res) => {
  // console.log("req body", req.body);
  const { userId, cartId, productId, selectedColors } = req.body;

  try {
    // Fetch the product
    const product = await productModel.findById(productId).populate([
      {
        path: "colors._id",
        select: "_id name color_id",
      },
      {
        path: "colors.sizes.size",
        model: "size",
        select: "_id name size_id price", // Include price in the query
      },
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let cart;

    if (cartId) {
      // Fetch an existing cart
      cart = await cartModel.findById(cartId);

      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      if (cart.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to modify this cart",
        });
      }
    } else {
      // Create a new cart
      cart = new cartModel({ user: userId, items: [] });
    }

    // Initialize a cart item structure
    const cartItem = {
      product_id: productId,
      total: 0,
      colors: [],
    };

    for (const colorSelection of selectedColors) {


      
      const { _id: colorId, sizes } = colorSelection;

      
     

      // Find the matching color
      const color = product.colors.find(
        (color) => color._id._id.toString() === colorId
      );

      if (!color) {
        throw new Error(`Color ${colorId} not found for the selected product`);
      }

    

      // Process sizes
      const sizeDetails = sizes.map((sizeEntry) => {

        const size = color.sizes.find(
          (s) => s.size._id.toString() === sizeEntry._id
        );

    

        if (!size) {
          throw new Error(
            `Size ${sizeEntry.size} not found for the selected color`
          );
        }

        const subtotal = Number(sizeEntry.orderQuantity) * Number(size.price); // Calculate subtotal

     

        return {
          size_id: size.size._id.toString(),
          quantity: Number(sizeEntry.orderQuantity),
          price: Number(size.price),
          subtotal,
        };
      });


      // Add the color and size information to the cart item
      cartItem.colors.push({
        color_id: colorId,
        sizes: sizeDetails,
      });

      // Calculate the total for the current color selection
      const colorTotal = sizeDetails.reduce(
        (subtotal, size) => Number(subtotal) + Number(size.subtotal),
        0
      );

      cartItem.total += Number(colorTotal);
    }

    // Check if the product already exists in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update the existing item
      cart.items[existingItemIndex] = cartItem;
    } else {
      // Add the new item to the cart
      cart.items.push(cartItem);
    }

        // console.log("updatedCart", cart);
        // process.exit();

    // Save the cart
    const updatedCart = await cart.save();

    // console.log("updatedCart", updatedCart);
    // process.exit();

    res.status(200).json({
      success: true,
      message: cartId ? "Cart updated successfully" : "New cart created",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const addToCartOld = async (req, res) => {
  console.log("req body", req.body);
  const { userId, cartId, productId, selectedColors } = req.body;

  try {
    // Fetch the product
    const product = await productModel.findById(productId).populate([
      {
        path: "colors._id",
        select: "_id name color_id",
      },
      {
        path: "colors.sizes.size",
        model: "size",
        select: "_id name size_id price", // Include price in the query
      },
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let cart;

    if (cartId) {
      // Fetch an existing cart
      cart = await cartModel.findById(cartId);

      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      if (cart.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to modify this cart",
        });
      }
    } else {
      // Create a new cart
      cart = new cartModel({ user: userId, items: [] });
    }

    // Initialize a cart item structure
    const cartItem = {
      product_id: productId,
      total: 0,
      colors: [],
    };

    for (const colorSelection of selectedColors) {
      const { colorId, sizes } = colorSelection;

      // Find the matching color
      const color = product.colors.find(
        (color) => color._id._id.toString() === colorId
      );
      if (!color) {
        throw new Error(`Color ${colorId} not found for the selected product`);
      }

      // Process sizes
      const sizeDetails = sizes.map((sizeEntry) => {
        const size = color.sizes.find(
          (s) => s.size._id.toString() === sizeEntry.size
        );
        if (!size) {
          throw new Error(
            `Size ${sizeEntry.size} not found for the selected color`
          );
        }

        const subtotal = Number(sizeEntry.quantity) * Number(size.price); // Calculate subtotal

        return {
          size_id: size.size._id.toString(),
          quantity: Number(sizeEntry.quantity),
          price: Number(size.price),
          subtotal,
        };
      });

      // Add the color and size information to the cart item
      cartItem.colors.push({
        color_id: colorId,
        sizes: sizeDetails,
      });

      // Calculate the total for the current color selection
      const colorTotal = sizeDetails.reduce(
        (subtotal, size) => Number(subtotal) + Number(size.subtotal),
        0
      );

      cartItem.total += Number(colorTotal);
    }

    // Check if the product already exists in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update the existing item
      cart.items[existingItemIndex] = cartItem;
    } else {
      // Add the new item to the cart
      cart.items.push(cartItem);
    }

    console.log("Cart item:", cartItem);

    // Save the cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: cartId ? "Cart updated successfully" : "New cart created",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
