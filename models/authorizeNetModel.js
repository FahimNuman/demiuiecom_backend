import mongoose from "mongoose";

const AuthorizeNetSchema = new mongoose.Schema({
  apiLoginId: { type: String },
  transactionKey: { type: String },
  sandbox: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("AuthorizeNet", AuthorizeNetSchema);
