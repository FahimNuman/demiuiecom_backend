import mongoose from "mongoose";

const taskGroupSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Process", // was "user" before, should reference process
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TaskGroup", taskGroupSchema);
