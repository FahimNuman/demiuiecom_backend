import { retrieveAndFormatColors } from "../helpers/color.js";
import colorModel from "../models/colorModel.js";

export const addColor = async (req, res) => {
  try {
    const { name, color_id, images, date } = req.body;

    if (!name || !color_id || !date || !images) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const colorData = {
      name,
      color_id,
      images: images || [],
      date: Date.now(),
    };

    const newColor = new colorModel(colorData);
    await newColor.save();


    // const newColor = await colorModel.create({ name, color_id, images, date });

    res.status(201).json({ message: "Color created successfully.", data: newColor });
  } catch (error) {
    res.status(500).json({ message: "Error creating color.", error: error.message });
  }
};


// List all colors
export const listColors = async (req, res) => {
  try {
    const filter = req.params.id ? { _id: req.params.id } : {}; // Filter by ID if provided
    const colors = await retrieveAndFormatColors(filter);

    if (req.params.id && colors.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const response = req.params.id
      ? { success: true, product: colors[0] }
      : { success: true, count: colors.length, colors };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};








// Get color by ID
export const getColorById = async (req, res) => {
  try {
    const { id } = req.params;
    const color = await colorModel.findById(id);

    if (!color) {
      return res.status(404).json({ message: "Color not found." });
    }

    res.status(200).json({ data: color });
  } catch (error) {
    res.status(500).json({ message: "Error fetching color.", error: error.message });
  }
};

// Update a color
export const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedColor = await colorModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedColor) {
      return res.status(404).json({ message: "Color not found." });
    }

    res.status(200).json({ message: "Color updated successfully.", data: updatedColor });
  } catch (error) {
    res.status(500).json({ message: "Error updating color.", error: error.message });
  }
};

// Delete a color
export const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedColor = await colorModel.findByIdAndDelete(id);

    if (!deletedColor) {
      return res.status(404).json({ success: false, message: "Color not found." });
    }

    res.status(200).json({
      success: true,
      message: "Color removed successfully.",
      data: deletedColor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting color.",
      error: error.message,
    });
  }
};
