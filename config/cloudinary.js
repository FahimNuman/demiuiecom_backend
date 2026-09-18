import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLDN_NAME,
  api_key: process.env.CLDN_API_KEY,
  api_secret: process.env.CLDN_SECRET_KEY

});

export default cloudinary;
