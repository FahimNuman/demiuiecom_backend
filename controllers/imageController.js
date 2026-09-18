import multiparty from "multiparty"
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.js";
import imageModel from "../models/imageModel.js";



// Upload Single Image
export const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "No file Selected." });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "project_images",
    });

    // Extract additional metadata
    const { originalname, size } = file; // From multer
    const { format, width, height } = result;


    // Save image metadata to MongoDB
    const newImage = new imageModel({
      url: result.secure_url,
      public_id: result.public_id,
      name: originalname,
      size,
      format,
      width,
      height,
      title: req.body.title || null,
      tags: req.body.tags ? req.body.tags.split(",") : [],
    });
    await newImage.save();

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
};



export const uploadGalleryImageOLD = async (req, res, next) => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Error parsing form data" });
    }

    try {
      // Validate file existence
      if (!files.image || files.image.length === 0) {
        return res.status(400).json({ error: "No images uploaded." });
      }

      console.log("Received images:", files.image);

      // ✅ Return file data instead of exiting
      res.json({ message: "Files received successfully", files: files.image });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};


export const uploadGalleryImage = async (req, res) => {
  try {
    const files = req.files; // ✅ Remove ".images"

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: "project_images" })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const images = await Promise.all(
      files.map(async (file, index) => {
        const { secure_url, public_id } = uploadResults[index];

        const newImage = new imageModel({
          url: secure_url,
          public_id,
        });
        await newImage.save();
        return newImage;
      })
    );

    res.status(201).json({
      status: 'success',
      message: "Images uploaded successfully",
      images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    });
  }
};


// Upload Multiple Images
export const uploadMultipleImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: "project_images" })
    );

    const uploadResults = await Promise.all(uploadPromises);

    const images = await Promise.all(
      files.map(async (file, index) => {
        const { originalname, size } = file; // From multer
        const { secure_url, public_id, format, width, height } =
          uploadResults[index];

        const newImage = new imageModel({
          url: secure_url,
          public_id,
          name: originalname,
          size,
          format,
          width,
          height,
          title: req.body.title || null, // Optional title from API request
          tags: req.body.tags ? req.body.tags.split(",") : [], // Optional tags from API request
        });
        await newImage.save();
        return newImage;
      })
    );

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    });
  }
};

// Retrieve Image Metadata by ID
export const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await imageModel.findById(id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    res.status(200).json(image);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching image", error: error.message });
  }
};

// List all images
export const listImages = async (req, res) => {
  try {
    const images = await imageModel.find();
    res.json({ success: true, images });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};



// Update Image Metadata
export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate request data
    if (!updateData.title && !updateData.tags) {
      return res.status(400).json({
        success: false,
        message: "At least one field (title or tags) is required to update.",
      });
    }

    // Find and update image
    const updatedImage = await imageModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating image",
      error: error.message,
    });
  }
};

// Delete Image
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the image
    const image = await imageModel.findById(id);
    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // Delete from MongoDB
    await imageModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const images = await imageModel.find();
    res.json({ success: true, images });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}
