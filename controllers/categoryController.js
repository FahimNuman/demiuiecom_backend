import Category from "../models/categoryModel.js";
import cloudinary from "../helpers/CloudinaryConfig.js";

// Create a new category
export const createCategory = async (req, res) => {
  try {
    let url = null;
    let public_id = null;

    if (req.file) {
      // const result = await cloudinary.uploader.upload(req.file.path, {
      //   folder: "category_images",
      // });

      try {
        // Upload file buffer to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "product",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer); // Send file buffer to Cloudinary
        });
        url = uploadResult.secure_url;
        public_id = uploadResult.public_id;
        
      } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return res
          .status(500)
          .json({ status: "failed", message: error.message });
      }
    }


    const newCategory = new Category({
      url: url,
      public_id: public_id,
      name: req.body.name || null,
      description: req.body.description || null,
      status: req.body.status || null,
      subCategories: req.body.subCategories || null,

    });

    const saveCategory = await newCategory.save();

    res.status(201).json({ success: true, newCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listCategories = async (req, res) => {
  try {
    // console.log("listCategories");

    const categories = await Category.find().populate("subCategories");

    // console.log("categories", categories);

    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

// Get a category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("subCategories");

    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  const { name, description, status, subCategories } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, status, subCategories },
      { new: true }
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a subcategory to an existing category
export const addSubCategory = async (req, res) => {
  const { name, description, status } = req.body;
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    category.subCategories.push({ name, description, status });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubCategory = async (req, res) => {
  const { id, subCategoryId } = req.params; // Get category ID and subcategory ID
  const { name, description, status } = req.body; // Fields to update

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find the subcategory by its ID
    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    // Update subcategory fields
    if (name) subCategory.name = name;
    if (description) subCategory.description = description;
    if (status) subCategory.status = status;

    // Save the updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating subcategory",
      error: error.message,
    });
  }
};
