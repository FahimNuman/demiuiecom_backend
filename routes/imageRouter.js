import express from "express";
import multer from "multer";
import {
  getImageById,
  listImages,
  uploadImage,
  uploadMultipleImages,
  updateImage, // Import updateImage
  deleteImage, // Import deleteImage
  uploadGalleryImage,
  getAllImages
} from "../controllers/imageController.js";

import upload from "../middleware/multer.js";

import imageUpload from "../middleware/multerImage.js";



const imageRouter = express.Router();


// Routes
imageRouter.post("/", upload.single("image"), uploadImage); // Upload single image
imageRouter.post("/multiple", upload.array("images", 10), uploadMultipleImages); // Upload multiple images
imageRouter.get("/:id", getImageById); // Get image by ID
imageRouter.get("/", listImages); // List all images




imageRouter.post("/gallery-images", imageUpload.array("images", 10), uploadGalleryImage);
imageRouter.get("/", getAllImages);

// imageRouter.post(
//   "/gallery-images",
//   upload.any(), 
//   uploadGalleryImage
// );

// New routes
imageRouter.put("/:id", updateImage); // Update image metadata
imageRouter.delete("/:id", deleteImage); // Delete image

export default imageRouter;
