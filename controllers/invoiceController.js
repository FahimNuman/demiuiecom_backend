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



// Adding a product
// const getInvoices = async (req, res) => {
//     try {
//         const invoices = await invoiceModel.find();
//         res.json({ success: true, invoices });
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// }


const getInvoices = async (req, res) => {
    try {
        const invoices = await invoiceModel.find().populate('supplierId');

        const invoiceIds = invoices.map(inv => inv._id);
        const invoiceItems = await invoiceItemModel.find({ invoiceId: { $in: invoiceIds } });

        // Group items by invoiceId
        const itemsByInvoice = invoiceItems.reduce((acc, item) => {
            const id = item.invoiceId.toString();
            if (!acc[id]) acc[id] = [];
            acc[id].push(item);
            return acc;
        }, {});

        // Attach items to their respective invoice
        const invoicesWithItems = invoices.map(invoice => {
            return {
                ...invoice.toObject(),
                items: itemsByInvoice[invoice._id.toString()] || []
            };
        });

        res.json({ status: "success", invoices: invoicesWithItems });
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

export {
    getInvoices
};
