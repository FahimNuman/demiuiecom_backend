import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Policy", policySchema);
