import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Existing fields
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    // New fields for detailed registration
    // Step 1: Company and Address Information
    companyDetails: {
      companyName: { type: String, required: true },
      attention: String,
    },
    billingDetails: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      stateProvince: { type: String, required: true },
      postalCode: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      faxNumber: String,
      addressType: {
        type: String,
        enum: ["Business", "Residential"],
        required: true,
      },
    },
    shippingDetails: {
      sameAsBilling: { type: Boolean, default: false },
      address: String,
      city: String,
      stateProvince: String,
      postalCode: String,
      addressType: { type: String, enum: ["Business", "Residential"] },
    },

    // Step 2: Business and Preferences
    businessInformation: {
      businessType: {
        type: String,
        enum: ["Retailer", "Decorator", "Distributor", "Other"],
        required: true,
      },
      otherBusinessType: String,
      businessDescription: String,
      tradeOrganization: {
        type: String,
        enum: ["None", "ASI", "SAGE", "PPAI", "Other"],
      },
    },
    productDecoration: {
      doesEmbellish: { type: Boolean, required: true },
      embellishmentTypes: [
        {
          type: String,
          enum: [
            "Screen Printing",
            "Embroidery",
            "Heat Transfer",
            "Sublimation",
            "Other",
          ],
        },
      ],
      doesResell: { type: Boolean, required: true },
    },
    preferences: {
      currentSupplier: String,
      annualSpend: {
        type: String,
        enum: ["Less than $30,000", "$30,000–$50,000", "More than $50,000"],
        required: true,
      },
      preferredBrands: [
        {
          type: String,
          enum: ["Next Level Apparel", "Bella+Canvas", "Gildan", "Other"],
        },
      ],
      websiteUrl: String,
    },

    // Step 3: Additional User Details
    userDetails: {
      jobTitle: String,
      phoneNumber: { type: String, required: true },
      alternateEmail: String,
    },
    marketingPreferences: {
      subscribeToEmails: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
