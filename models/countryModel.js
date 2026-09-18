import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
  name: String,
  capital: [String],
  region: String,
  flag: String
});

const countryModel =
  mongoose.models.country || mongoose.model("country", countrySchema);

export default countryModel;
