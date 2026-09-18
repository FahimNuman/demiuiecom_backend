import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }, // Cloudinary public ID
  name: { type: String, default: null }, // File name
  size: { type: Number, default: null }, // File size in bytes
  format: { type: String, default: null }, // File format (e.g., jpg, png)
  width: { type: Number, default: null }, // Image width
  height: { type: Number, default: null }, // Image height
  title: { type: String, default: null }, // Optional title for the image
  tags: { type: [String], default: [] }, // Optional tags as an array
  createdAt: { type: Date, default: Date.now },
});

const imageModel =
  mongoose.models.image || mongoose.model("image", imageSchema);

export default imageModel;
