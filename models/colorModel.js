import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color_id: { type: String, require: true },
  date: { type: Date},
  sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: "size" }],
  images: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "image",
    },
  ],
});

const colorModel =
  mongoose.models.color || mongoose.model("color", colorSchema);

export default colorModel;
