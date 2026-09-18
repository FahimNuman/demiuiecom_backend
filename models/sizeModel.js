import mongoose from "mongoose";

export const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size_id: { type: String, required: true },
  date: { type: Date },
});

const sizeModel = mongoose.models.size || mongoose.model("size", sizeSchema);

export default sizeModel;
