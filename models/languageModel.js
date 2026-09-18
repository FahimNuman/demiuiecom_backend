import mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
  name: String,
  code: String
});

const languageModel =
  mongoose.models.language || mongoose.model("language", languageSchema);

export default languageModel;
