import sizeModel from "../models/sizeModel.js";

export const addSize = async (req, res) => {
  try {
    const sizes = req.body;

    // Validate the array and each object within it
    // if (!Array.isArray(sizes) || sizes.some((size) => !size.name || !size.size_id || !size.date)) {
    //   return res.status(400).json({ message: "All fields are required for every size." });
    // }

    // Insert sizes in bulk
    const newSizes = await sizeModel.insertMany(sizes);

    res
      .status(201)
      .json({ message: "Sizes created successfully.", data: newSizes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating sizes.", error: error.message });
  }
};

// List all sizes
export const listSizes = async (req, res) => {
  try {
    const sizes = await sizeModel.find();
    res.json({ success: true, sizes });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get size by ID
export const getSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await sizeModel.findById(id);

    if (!size) {
      return res.status(404).json({ message: "Size not found." });
    }

    res.status(200).json({ data: size });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching size.", error: error.message });
  }
};

// Update a size
export const updateSize = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSize = await sizeModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedSize) {
      return res.status(404).json({ message: "Size not found." });
    }

    res
      .status(200)
      .json({ message: "Size updated successfully.", data: updatedSize });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating size.", error: error.message });
  }
};

// Delete a size
export const deleteSize = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSize = await sizeModel.findByIdAndDelete(id);

    if (!deletedSize) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found." });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Size removed successfully.",
        data: deletedSize,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting size.",
        error: error.message,
      });
  }
};
