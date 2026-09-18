import mongoose from "mongoose";

export const settingSchema = new mongoose.Schema({
  email: { type: String, required: false },
  toEmail: { type: String, required: false },
  appPassword: { type: String, required: false },
  code: { type: String, required: false },
  pin: { type: String, required: false },
  expairTime: { type: String, required: false },
  sessionUnit: { type: String, required: false },
});

const settingModel = mongoose.models.setting || mongoose.model("setting", settingSchema);

export default settingModel;
