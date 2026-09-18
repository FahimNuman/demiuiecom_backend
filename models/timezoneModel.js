// models/timezoneModel.js
import mongoose from "mongoose";

const timezoneSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
  },
});

const timezoneModel =
  mongoose.models.timezone || mongoose.model("timezone", timezoneSchema);

export default timezoneModel;
