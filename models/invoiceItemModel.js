import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  colorId: {
    type: String,
    required: true,
  },
  colorName: {
    type: String,
    required: true,
  },
  sizeId: {
    type: String,
    required: true,
  },
  sizeName: {
    type: String,
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true 
});

const invoiceItemModel = mongoose.models.InvoiceItem || mongoose.model("InvoiceItem", invoiceItemSchema);

export default invoiceItemModel;
