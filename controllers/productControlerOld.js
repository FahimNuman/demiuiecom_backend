// import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import invoiceModel from "../models/invoiceModel.js";
import invoiceItemModel from "../models/invoiceItemModel.js";
import colorModel from "../models/colorModel.js";
import sizeModel, { sizeSchema } from "../models/sizeModel.js";
import mongoose from "mongoose";
import { retrieveAndFormatProducts } from "../helpers/product.js";
// const cloudinary from "./"
import cloudinary from "../helpers/CloudinaryConfig.js";
// const multiparty = require("multiparty");
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
                folder: "product"
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
          return res.status(500).json({ status: "failed", message: error.message });
        }
      }


      // console.log("color", color);
      // process.exit();

      let colorData = {
        _id: color._id,
        images: colorImageArr,
        sizes: color.sizes.map((size) => ({
          size: size.size,
          price: Number(size.price),
          costPrice:Number(size.costPrice),
          quantity:Number(size.quantity),
          lowQuantity:Number(size.lowQuantity),
        })),
      };
      colourAttributeItems.push(colorData);
    }

    const productData = {
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

    // console.log("productData", colourAttributeItems[0]);
    // process.exit();

    const product = new productModel(productData);
    await product.save();

    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Adding a product
const addProductOld = async (req, res) => {
  

  // console.log("req.body", req.body);
  // process.exit();

  // try {
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
      colors, // Format: [{ _id: colorId, sizes: [{ size: sizeId, price: price }] }]
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
          costPrice:Number(size.costPrice),
          quantity:Number(size.quantity),
          lowQuantity:Number(size.lowQuantity),
        })),
      }
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
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ success: false, message: error.message });
  // }
};


// Adding bulk products
const addBulkProducts = async (req, res) => {
  try {
    const products = req.body.products; // Expecting an array of product objects

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
          colors: colors?.map((color) => ({
            _id: color._id,
            sizes: color.sizes.map((size) => ({
              size: size.size,
              price: Number(size.price),
              costPrice:Number(size.costPrice),
              quantity:Number(size.quantity),
              lowQuantity:Number(size.lowQuantity),
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
// list product

const getProducts = async (req, res) => {
  try {
    const filter = req.params.id ? { _id: req.params.id } : {}; // Filter by ID if provided
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


// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Get product ID from request parameters
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
      colors, // Format: [{ _id: colorId, sizes: [{ size: sizeId, price: price }] }]
      popular,
    } = req.body;

    // Find the product by ID
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
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
    product.images = images || product.images;
    product.popular = popular === "true" || product.popular;

    // Update colors if provided
    if (colors) {
      product.colors = colors.map((color) => ({
        _id: color._id,
        sizes: color.sizes.map((size) => ({
          size: size.size,
          price: Number(size.price),
          costPrice:Number(size.costPrice),
          quantity:Number(size.quantity),
          lowQuantity:Number(size.lowQuantity),
        })),
      }));
    }

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




// remove product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Single product
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
  const { productId,invoiceNumber,supplierId,items } = req.body;

  const product = await productModel.findById(productId);

  let totalPrice = 0;

  items.forEach(async (item) => {
    
    const color = product?.colors.find((c) => 
      c._id.toString() === item?.variation?.colorId
    );

    if (color) {
      const size = color.sizes.find((s) => s.size.toString() === item?.variation?.sizeId);
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
    invoiceType: "PURCHASE",
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
      price: item?.price
    })
  })



};


const addInventory = async (req, res) => {
  try {
    const { productId, invoiceNumber, supplierId, items } = req.body;

    const product = await productModel.findById(productId);
    let totalPrice = 0;

    for (const item of items) {
      const color = product?.colors.find((c) =>
        c._id.toString() === item?.variation?.colorId
      );

      if (color) {
        const size = color.sizes.find((s) => s.size.toString() === item?.variation?.sizeId);
        totalPrice += item.unit_cost * item.quantity;

        if (size) {
          size.quantity += item?.quantity;
        }
      }
    }

    await product.save();

    // Create invoice
    const invoice = await invoiceModel.create({
      supplierId,
      productId,
      invoiceNumber,
      totalPrice,
      invoiceType: "PURCHASE",
    });

    const insertedId = invoice._id;

    // Create invoice items
    for (const item of items) {

      let itemData = {
        invoiceId: insertedId,
        productId: productId,
        colorId: item?.variation?.colorId,
        colorName: item?.variation?.color,
        sizeId: item?.variation?.sizeId,
        sizeName: item?.variation?.size,
        quantity: item?.quantity,
        price: item?.unit_cost
      }

      await invoiceItemModel.create(itemData);
    }

    res.json({ status: "success", message: "Inventory added successfully", invoiceId: insertedId });

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




  async function getSettingInfo() {
    const setting = await settingModel.findOne({});
    return setting;
  }

  async function setupTransporter() {
    const setting = await getSettingInfo();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: setting.email,
        pass: setting.appPassword
      },
    });

    return transporter;
  }

  const sentMail = async (req, res) => {
    
    try {
      // Send email
      const setting = await getSettingInfo();
      const uniqueNumber = generateUniqueSixDigitNumber();
      const info = await transporter.sendMail({
            from: `"RSIKDER" <${setting.email}>`, // Sender address
            to: setting.toEmail, // Recipient email
            subject: "Verification key here", // Subject line
            text: `Your verification key is ${uniqueNumber}`, // Plain text body
        });

        if(info.accepted.length > 0) {
          await settingModel.findOneAndUpdate(
            {},
            { code: uniqueNumber },
            { upsert: true, new: true }
          );

          res.json({
            status: "success",
            message: "Email sent successfully"
          });
        }
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        res.status(500).send('Failed to send email.');
    }
  }


export {
  addProduct,
  addBulkProducts,
  getProducts,
  removeProduct,
  singleProduct,
  removeSingleProduct,
  updateProduct,
  addInventory,
  sentMail
};
