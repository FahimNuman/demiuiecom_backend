import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    productId: {
        type: String,
        required: true,
    },
    returnOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReturnOrder',
        required: false,
        default: null
    },
    invoiceNumber: {
        type: String,
        required: true,
        trim: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    receivedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    invoiceType: {
        type: String,
        required: true,
        enum: ['PURCHASE', 'RETURN', 'SERVICE'],
        trim: true
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const invoiceModel = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);

export default invoiceModel;