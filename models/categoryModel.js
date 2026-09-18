import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  url: {
    type: String,
    default: null,
  },
  public_id: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null, // Optional description for the subcategory
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active", // Status for subcategories
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp for when the subcategory was created
  },
});

const categorySchema = new mongoose.Schema({
  url: {
    type: String,
    default: null,
  },
  public_id: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null, // Optional description for the category
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active", // Status for the category
  },
  subCategories: [subCategorySchema], // Array of subcategories
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp for when the category was created
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp for when the category was last updated
  },
});

// Automatically update `updatedAt` field on updates
categorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
