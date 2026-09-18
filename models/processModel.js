import mongoose from "mongoose";

const processSchema = new mongoose.Schema(
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
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "admin",
                required: true,
            },
        ],
        status: {
            type: String,
            enum: ["open", "completed", "cancelled"],
            default: "open",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Process", processSchema);
