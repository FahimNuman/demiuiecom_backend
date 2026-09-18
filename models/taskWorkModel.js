import mongoose from "mongoose";

const labelSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, default: "" }, 
  }
);

const attachmentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, default: "" }, 
  }
);

const taskWorkSchema = new mongoose.Schema(
  {
    processId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Process",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskGroup",
      required: true,
    },
    instruction: {
      type: String,
      required: false,
    },
    startTime: {
      type: String,
      required: false,
    },
    endTime: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    labelName: [labelSchema],     
    attachment: [attachmentSchema], 
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TaskWork", taskWorkSchema);
