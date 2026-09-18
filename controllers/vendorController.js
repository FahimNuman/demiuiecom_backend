import vendorModel from "../models/vendorModel.js";
import validator from "validator";
import asyncHandler from "express-async-handler";

export const registerVendor = asyncHandler(async (req, res) => {
  const { name, companyName, email, phoneNo, address, website, country, city, state, postcode } = req.body;

  if (!name || !companyName || !email || !phoneNo || !address) {
    res.status(400);
    throw new Error("Please provide all required fields: name, companyName, email, phoneNo, and address");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  const vendorExists = await vendorModel.findOne({ email });
  if (vendorExists) {
    res.status(400);
    throw new Error("Vendor with this email already exists");
  }

  const vendor = await vendorModel.create({
    name,
    companyName,
    email,
    phoneNo,
    address,
    website,
    country,
    city,
    state,
    postcode,
  });

  if (vendor) {
    res.status(201).json({
      _id: vendor._id,
      name: vendor.name,
      companyName: vendor.companyName,
      email: vendor.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid vendor data");
  }
});

export const listVendors = asyncHandler(async (req, res) => {
  const vendors = await vendorModel.find({});
  res.json(vendors);
});

export const getVendorDetails = asyncHandler(async (req, res) => {
  // Use req.params.vendorId instead of req.query
  const vendorId = req.params.vendorId;

  if (!vendorId) {
    res.status(400);
    throw new Error("Vendor ID is required");
  }

  const vendor = await vendorModel.findById(vendorId);

  if (vendor) {
    res.json({
      _id: vendor._id,
      name: vendor.name,
      companyName: vendor.companyName,
      email: vendor.email,
      phoneNo: vendor.phoneNo,
      address: vendor.address,
      website: vendor.website,
      country: vendor.country,
      city: vendor.city,
      state: vendor.state,
      postcode: vendor.postcode,
    });
  } else {
    res.status(404);
    throw new Error("Vendor not found");
  }
});