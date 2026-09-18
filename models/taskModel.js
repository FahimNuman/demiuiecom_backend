import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        processId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Process",  
            required: true
        },
        // adminId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "admin",     
        //     required: true
        // },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        priority: {
            type: String,
            enum: ['Emergency', 'High', 'Medium', 'Low'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ["assign", "inprogress", "completed", "cancelled"],
            default: "inprogress",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Task", taskSchema);
