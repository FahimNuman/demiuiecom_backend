import productModel from "../models/productModel.js";
import invoiceModel from "../models/invoiceModel.js";
import invoiceItemModel from "../models/invoiceItemModel.js";
import colorModel from "../models/colorModel.js";
import sizeModel, { sizeSchema } from "../models/sizeModel.js";
import mongoose from "mongoose";
import { retrieveAndFormatProducts } from "../helpers/product.js";
import cloudinary from "../helpers/CloudinaryConfig.js";
import nodemailer from "nodemailer";
import settingModel from "../models/settingModel.js";

const addProduct = async (req, res) => {
  try {
    // Parse colors from formData
    const colors = JSON.parse(req.body.colors || "[]");

    const {
      name,
      description,
      sku,
      sku_id,
      price,
      category,
      subCategory,
      brand_name,
      style_id,
      popular,
      supplierId,
    } = req.body;

    let colourAttributeItems = [];

    for (const color of colors) {
      let colorImageArr = [];

      // Get uploaded images for this color
      const imageFiles = req.files.filter((file) =>
        file.fieldname.startsWith(`images_${color._id}`)
      );

      for (let file of imageFiles) {
        try {
          // Upload file buffer to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "image",
                folder: "product",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(file.buffer); // Send file buffer to Cloudinary
          });

          colorImageArr.push({
            image: uploadResult.secure_url,
            cloudImageId: uploadResult.public_id,
          });
        } catch (error) {
          console.error("Cloudinary Upload Error:", error);
          return res
            .status(500)
            .json({ status: "failed", message: error.message });
        }
      }

      let colorData = {
        _id: color._id,
        images: colorImageArr,
        sizes: color.sizes.map((size) => ({
          size: size.size,
          price: Number(size.price),
          costPrice: Number(size.costPrice),
          quantity: Number(size.quantity),
          lowQuantity: Number(size.lowQuantity),
        })),
      };
      colourAttributeItems.push(colorData);
    }

    const productData = {
      supplierId,
      name,
      description,
      sku,
      sku_id,
      price: Number(price),
      category,
      subCategory,
      brand_name,
      style_id,
      popular: popular === "true",
      colors: colourAttributeItems,
      date: Date.now(),
    };

    const product = new productModel(productData);
    await product.save();
    

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });


    const productId = "683992e4e3e81c905c792c9a";
    const productInfo = await productModel.findById(productId);

    // console.log("=========================");
    // console.log("productInfo", productInfo);
    // console.log("=========================");

    // const invoice = await invoiceModel.create({
    //   supplierId: supplierId,
    //   productId: productInfo._id,
    //   invoiceNumber: "INV" + productInfo._id,
    //   totalPrice: 0,
    //   invoiceType: "new"
    // });

    // const insertedId = invoice.id;
    const insertedId = 111;

    let itemArr = [];

    // Ensure all color-related async tasks are completed
    const tasks = productInfo?.colors.map(async (item, colorIndex) => {
      console.log(`Processing color ${colorIndex + 1}:`, item); // Log the color being processed

      const colorId = item?._id;
      const color = await colorModel.findById(colorId);

      if (!item?.sizes || item.sizes.length === 0) {
        console.log(
          `  No sizes found for color ${color?.name}, skipping size processing.`
        );
      }

      // Create an array to hold the size-related items
      const sizeTasks = item?.sizes.map(async (sizeItem, sizeIndex) => {
        console.log(
          `  Processing size ${sizeIndex + 1} for color ${color?.name}:`,
          sizeItem
        ); // Log each size being processed

        const sizeId = sizeItem?.size;
        const size = await sizeModel.findById(sizeId);

        let sizeAtt = {
          invoiceId: insertedId,
          productId: productId,
          colorId: colorId,
          colorName: color?.name,
          sizeId: sizeId,
          sizeName: size?.name,
          quantity: sizeItem?.quantity || 0,
          price: sizeItem?.price || 0,
        };

        // Directly push to itemArr
        itemArr.push(sizeAtt);
      });

      // Wait for all size-related tasks to finish for the current color
      await Promise.all(sizeTasks);
    });

    // Wait for all color-related tasks to finish
    await Promise.all(tasks);

    // Now all items should be in itemArr, and we can log it
    console.log("Final itemArr", itemArr);
    console.log("-------------------------");

    // await invoiceItemModel.create({
    //   invoiceId: insertedId,
    //   productId: productId,
    //   colorId: item?.variation?.colorId,
    //   colorName: item?.variation?.color,
    //   sizeId: item?.variation?.sizeId,
    //   sizeName: item?.variation?.size,
    //   quantity: item?.quantity,
    //   price: item?.price
    // })


  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addProductOld = async (req, res) => {
  const {
    name,
    description,
    sku,
    sku_id,
    price,
    category,
    subCategory,
    brand_name,
    style_id,
    images,
    colors,
    popular,
  } = req.body;

  let colourAttributeItems = [];

  for (const color of colors) {
    let imageUrl = null;
    let cloudImageId = null;

    let colorImageArr = [];

    if (color?.images && color.images.length > 0) {
      for (let image of color.images) {
        try {
          const uploadResult = await cloudinary.uploader.upload(image);
          imageUrl = uploadResult.url;
          cloudImageId = uploadResult.public_id;

          colorImageArr.push({
            image: imageUrl,
            cloudImageId: cloudImageId,
          });
        } catch (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({
            status: "failed",
            message: error.message,
          });
        }
      }
    }

    let colorImage = {
      _id: color._id,
      images: colorImageArr,
      sizes: color.sizes.map((size) => ({
        size: size.size,
        price: Number(size.price),
        costPrice: Number(size.costPrice),
        quantity: Number(size.quantity),
        lowQuantity: Number(size.lowQuantity),
      })),
    };
    colourAttributeItems.push(colorImage);
  }

  const productData = {
    name,
    description,
    sku,
    sku_id,
    price: Number(price),
    images: images || [],
    category,
    subCategory,
    brand_name,
    style_id,
    popular: popular === "true",
    colors: colourAttributeItems,
    date: Date.now(),
  };

  const product = new productModel(productData);
  await product.save();

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
};

const addBulkProducts = async (req, res) => {
  try {
    const products = req.body.products;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of products",
      });
    }

    const createdProducts = [];
    const errors = [];

    for (const productData of products) {
      try {
        const {
          name,
          description,
          sku,
          sku_id,
          price,
          category,
          subCategory,
          brand_name,
          style_id,
          images,
          colors,
          popular,
        } = productData;

        const formattedProduct = {
          name,
          description,
          sku,
          sku_id,
          price: Number(price),
          images: images || [],
          category,
          subCategory,
          brand_name,
          style_id,
          popular: popular === "true",
          colors:
            colors?.map((color) => ({
              _id: color._id,
              sizes: color.sizes.map((size) => ({
                size: size.size,
                price: Number(size.price),
                costPrice: Number(size.costPrice),
                quantity: Number(size.quantity),
                lowQuantity: Number(size.lowQuantity),
              })),
            })) || [],
          date: Date.now(),
        };

        const product = new productModel(formattedProduct);
        await product.save();
        createdProducts.push(product);
      } catch (error) {
        errors.push({
          product: productData,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Bulk product upload processed",
      createdCount: createdProducts.length,
      errorCount: errors.length,
      createdProducts,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing bulk upload: " + error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const filter = req.params.id ? { _id: req.params.id } : {};
    const products = await retrieveAndFormatProducts(filter);

    if (req.params.id && products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const response = req.params.id
      ? { success: true, product: products[0] }
      : { success: true, count: products.length, products };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      sku,
      sku_id,
      price,
      category,
      subCategory,
      brand_name,
      style_id,
      popular,
    } = req.body;

    // Parse colors from formData
    const colors = JSON.parse(req.body.colors || "[]");

    // Find the product by ID
    const product = await productModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.sku = sku || product.sku;
    product.sku_id = sku_id || product.sku_id;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.brand_name = brand_name || product.brand_name;
    product.style_id = style_id || product.style_id;
    product.popular =
      popular === "true" ? true : popular === "false" ? false : product.popular;

    // Process colors and images
    let colourAttributeItems = [];

    for (const color of colors) {
      let colorImageArr = [];

      // Get uploaded images for this color
      const imageFiles = req.files.filter((file) =>
        file.fieldname.startsWith(`images_${color._id}`)
      );

      for (let file of imageFiles) {
        try {
          // Upload file buffer to Cloudinary
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: "image",
                folder: "product",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(file.buffer);
          });

          colorImageArr.push({
            image: uploadResult.secure_url,
            cloudImageId: uploadResult.public_id,
          });
        } catch (error) {
          console.error("Cloudinary Upload Error:", error);
          return res
            .status(500)
            .json({ status: "failed", message: error.message });
        }
      }

      // Use existing images if no new images are uploaded
      const existingColor = product.colors.find(
        (c) => c._id.toString() === color._id
      );
      const images =
        colorImageArr.length > 0
          ? colorImageArr
          : existingColor
          ? existingColor.images
          : [];

      let colorData = {
        _id: color._id,
        images,
        sizes: color.sizes.map((size) => ({
          size: size.size,
          price: Number(size.price),
          costPrice: Number(size.costPrice),
          quantity: Number(size.quantity),
          lowQuantity: Number(size.lowQuantity),
        })),
      };
      colourAttributeItems.push(colorData);
    }

    // Update colors
    product.colors = colourAttributeItems;

    // Save the updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const addInventoryOld = async (req, res) => {
  const { productId, invoiceNumber, supplierId, items } = req.body;

  const product = await productModel.findById(productId);

  let totalPrice = 0;

  items.forEach(async (item) => {
    const color = product?.colors.find(
      (c) => c._id.toString() === item?.variation?.colorId
    );

    if (color) {
      const size = color.sizes.find(
        (s) => s.size.toString() === item?.variation?.sizeId
      );
      totalPrice += item.unit_cost * item.quantity;

      if (size) {
        size.quantity += item?.quantity;
        await product.save();
      }
    }
  });

  const invoice = await invoiceModel.create({
    supplierId: supplierId,
    productId: productId,
    invoiceNumber: invoiceNumber,
    totalPrice: totalPrice,
    invoiceType: "new",
  });

  const insertedId = invoice.id;

  items.forEach(async (item) => {
    console.log("item", item);
    await invoiceItemModel.create({
      invoiceId: insertedId,
      productId: productId,
      colorId: item?.variation?.colorId,
      colorName: item?.variation?.color,
      sizeId: item?.variation?.sizeId,
      sizeName: item?.variation?.size,
      quantity: item?.quantity,
      price: item?.price,
    });
  });
};

const addInventory = async (req, res) => {
  try {
    const { productId, invoiceNumber, supplierId, items } = req.body;

    const product = await productModel.findById(productId);
    let totalPrice = 0;

    for (const item of items) {
      const color = product?.colors.find(
        (c) => c._id.toString() === item?.variation?.colorId
      );

      if (color) {
        const size = color.sizes.find(
          (s) => s.size.toString() === item?.variation?.sizeId
        );
        totalPrice += item.unit_cost * item.quantity;

        if (size) {
          size.quantity += item?.quantity;
        }
      }
    }

    await product.save();

    const invoice = await invoiceModel.create({
      supplierId,
      productId,
      invoiceNumber,
      totalPrice,
      invoiceType: "PURCHASE",
    });

    const insertedId = invoice._id;

    for (const item of items) {
      let itemData = {
        invoiceId: insertedId,
        productId: productId,
        colorId: item?.variation?.colorId,
        colorName: item?.variation?.color,
        sizeId: item?.variation?.sizeId,
        sizeName: item?.variation?.size,
        quantity: item?.quantity,
        price: item?.unit_cost,
      };

      await invoiceItemModel.create(itemData);
    }

    res.json({
      status: "success",
      message: "Inventory added successfully",
      invoiceId: insertedId,
    });
  } catch (error) {
    console.error("Error adding inventory:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const removeSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: `Product ${product.name && product.name} successfully deleted!`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

function generateUniqueSixDigitNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function getTransporter() {
  const setting = await settingModel.findOne({});

  if (!setting || !setting.email || !setting.appPassword) {
    throw new Error("Missing SMTP configuration in settings");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: setting.email,
      pass: setting.appPassword,
    },
  });

  return transporter;
}

const sentMail = async (req, res) => {
  try {
    const setting = await settingModel.findOne({});
    const transporter = await getTransporter();

    const uniqueNumber = generateUniqueSixDigitNumber();

    const info = await transporter.sendMail({
      from: `"RSIKDER" <${setting.email}>`,
      to: `${setting.toEmail}`,
      subject: "Verification key here",
      text: `Your verification key is ${uniqueNumber}`,
    });

    if (info.accepted.length > 0) {
      await settingModel.findOneAndUpdate(
        {},
        { code: uniqueNumber },
        { upsert: true, new: true }
      );

      res.json({
        status: "success",
        message: "Email sent successfully",
      });
    } else {
      res.status(500).json({ status: "error", message: "Email not accepted" });
    }
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    res.status(500).send("Failed to send email.");
  }
};

export {
  addProduct,
  addBulkProducts,
  getProducts,
  removeProduct,
  singleProduct,
  removeSingleProduct,
  updateProduct,
  addInventory,
  sentMail,
};
