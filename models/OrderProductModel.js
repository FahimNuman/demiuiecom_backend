import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "color"  // Make sure this matches your color model name
    },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "size"  // Make sure this matches your size model name
    },
    quantity: { type: Number },
    price: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    
});

// Correct pre-save hook for orderProductSchema
orderProductSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const OrderProductModal = mongoose.models.orderProduct || mongoose.model("orderProduct", orderProductSchema);

export default OrderProductModal;