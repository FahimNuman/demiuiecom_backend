import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {

  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    required: false,
    trim: true,
    default: null
  },
  country: {
    type: String,
    required: false,
    trim: true,
    default: null
  },
  city: {
    type: String,
    required: false,
    trim: true,
    default: null
  },
  state: {
    type: String,
    required: false,
    trim: true,
    default: null
  },
  postcode: {
    type: String,
    required: false,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});



// Export the model
export default mongoose.model("Vendor", vendorSchema);