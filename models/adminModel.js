import mongoose from "mongoose";
import { type } from "os";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role", // Reference to Role collection
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country"
    },
    gender: {
       type: String,
       default: "",
    },
    pronouns: {
      type: String,
      default: "",
    },
    currencyPreference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency", // Reference to Currency collection
    },
    dataRetentionPeriod: {
      type: String,
      default: "",
    },
    preferredLanguage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language", // Reference to Language collection
    },
    timeZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timezone", // Reference to Timezone collection
    },
    dob: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    alternativeEmail: {
      type: String,
      default: "",
    },
    whatsapp: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    instagram: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      default: "",
    },
    team: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String, // Image URL or file path
      default: "",
    },
    publicId: {
      type: String, // Cloudinary public ID for the image
      default: "",
    },
    securityAnswer: {
      type: String,
      default: "",
    },
    securityQuestion: {
      type: String,
      default: "",
    },
    twoFactorMethod: {
      type: String,
      enum: ["none", "email", "sms", "authenticator"],
      default: "none",
    },
    lastLogin: {
      type: Date,
    },
    agreedToPolicies: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Admin", adminSchema);
