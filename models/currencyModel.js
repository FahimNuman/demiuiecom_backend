import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  name: String,
  code: String,
  symbol: String
});

const currencyModel =
  mongoose.models.currency || mongoose.model("currency", currencySchema);

export default currencyModel;
