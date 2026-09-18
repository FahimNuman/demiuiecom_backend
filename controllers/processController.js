import { stat } from "fs";
import processModel from "../models/processModel.js";



const index = async (req, res) => {
  try {
    const processes = await processModel.aggregate([
      // 1️⃣ Process → Tasks
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "processId",
          as: "tasks",
        },
      },

      // 2️⃣ Tasks → Groups
      { $unwind: { path: "$tasks", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "taskgroups",
          localField: "tasks._id",
          foreignField: "taskId",
          as: "tasks.groups",
        },
      },

      // 3️⃣ Groups → Works
      { $unwind: { path: "$tasks.groups", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "taskworks",
          localField: "tasks.groups._id",
          foreignField: "groupId",
          as: "tasks.groups.works",
        },
      },

      // 4️⃣ Groups → Users
      {
        $lookup: {
          from: "admins", // 👈 collection name
          localField: "tasks.groups.admins",
          foreignField: "_id",
          as: "tasks.groups.adminsInfo",
        },
      },

      // 5️⃣ Group back
      {
        $group: {
          _id: {
            processId: "$_id",
            taskId: "$tasks._id",
          },
          processName: { $first: "$name" },
          description: { $first: "$description" },
          task: { $first: "$tasks" },
          groups: { $push: "$tasks.groups" },
        },
      },

      // 6️⃣ Task + Groups merge
      {
        $addFields: {
          "task.groups": "$groups",
        },
      },
      { $project: { groups: 0 } },

      // 7️⃣ Group again by process
      {
        $group: {
          _id: "$_id.processId",
          processName: { $first: "$processName" },
          description: { $first: "$description" },
          tasks: { $push: "$task" },
        },
      },
    ]);

    res.json({ status: "success", data: processes });
  } catch (error) {
    console.error("Error fetching nested process:", error.message);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while fetching nested process.",
      error: error.message,
    });
  }
};





const indexc = async (req, res) => {
  try {
    const processes = await processModel.aggregate([
      // 🔹 1. Process → Tasks
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "processId",
          as: "tasks",
        },
      },

      // 🔹 2. Process → TaskGroups
      {
        $lookup: {
          from: "taskgroups",
          localField: "tasks._id",
          foreignField: "taskId",
          as: "taskGroups",
        },
      },

      // 🔹 3. TaskGroups → Users (Group wise)
      {
        $unwind: {
          path: "$taskGroups",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "taskGroups.admins",
          foreignField: "_id",
          as: "taskGroups.users", // overwrite with populated users
        },
      },

      // 🔹 4. Group back the taskGroups
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          tasks: { $first: "$tasks" },
          taskWorks: { $first: "$taskWorks" },
          taskGroups: { $push: "$taskGroups" },
        },
      },

      // (Optional) 5. Lookup TaskWorks (if needed)
      {
        $lookup: {
          from: "taskworks",
          localField: "tasks._id",
          foreignField: "taskId",
          as: "taskWorks",
        },
      },
    ]);

    res.json({ status: "success", data: processes });
  } catch (error) {
    console.error("Error fetching process:", error.message);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while fetching process.",
      error: error.message,
    });
  }
};



const indexNew = async (req, res) => {
  try {
    const processes = await processModel.aggregate([
      // 🔹 1. Process → Tasks
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "processId",
          as: "tasks",
        },
      },

      // 🔹 2. Process → TaskGroups
      {
        $lookup: {
          from: "taskgroups",
          localField: "tasks._id",
          foreignField: "taskId",
          as: "taskGroups",
        },
      },

      // 🔹 3. TaskGroups → Users
      {
        $lookup: {
          from: "admins",
          localField: "taskGroups.admins",
          foreignField: "_id",
          as: "taskGroupUsers",
        },
      },

      // 🔹 4. Process → TaskWorks
      {
        $lookup: {
          from: "taskworks",
          localField: "tasks._id",
          foreignField: "taskId",
          as: "taskWorks",
        },
      },

      // (Optional) 5. Group by process (to avoid duplicates if many relations)
      {
        $project: {
          name: 1,
          description: 1,
          tasks: 1,
          taskGroups: 1,
          taskWorks: 1,
          taskGroupUsers: 1,
        },
      },
    ]);

    res.json({ status: "success", data: processes });
  } catch (error) {
    console.error("Error fetching process:", error.message);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while fetching process.",
      error: error.message,
    });
  }
};


const index_ = async (req, res) => {
  try {
    const processes = await processModel.find({})
      .populate({
        path: "tasks", 
        populate: [
          {
            path: "groups", 
            populate: { path: "users" }
          },
          {
            path: "works",  
            populate: { path: "groupId" }
          }
        ]
      });

    res.json({ status: "success", data: processes });
  } catch (error) {
    console.error("Error fetching process:", error.message);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while fetching process.",
      error: error.message,
    });
  }
};

const indexOld = async (req, res) => {
    try {
        const process = await processModel.find({});
        res.json({ status: "success", data: process });
    } catch (error) {
        console.error("Error fetching process:", error.message);
        res.json({
            status: "error",
            message: "Something went wrong while fetching process.",
            error: error.message,
        });
    }
};

const store = async (req, res) => {
  try {
    const { name, description } = req.body.data;

    if (!name) {
      return res.json({ status: 'error', message: "Process name is required." });
    }

    // ✅ Check if process name already exists
    const existingProcess = await processModel.findOne({ name: name.trim() });
    if (existingProcess) {
      return res.json({ status: 'error', message: "Process name already exists." });
    }

    const process = new processModel({
      name: name.trim(),
      description
    });

    const result = await process.save();

    res.json({
      status: "success",
      message: "Process created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error creating process:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while creating the process.",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id, data } = req.body;
    const { name, description, isActive } = data;

    const process = await processModel.findById(id);

    if (!process) {
      return res.json({ status: 'error', message: "Process not found." });
    }

    const duplicate = await processModel.findOne({ name: name.trim(), _id: { $ne: id } });
    if (duplicate) {
      return res.json({ status: "error", message: "Process name already exists." });
    }

    process.name = name.trim();
    process.description = description;

    const result = await process.save();

    res.json({
      status: "success",
      message: "Process updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error updating Process:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while updating the Process.",
      error: error.message,
    });
  }
};


const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await processModel.findByIdAndDelete(id);
    res.json({
      status: "success",
      message: "Process deleted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting process:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while deleting the process.",
      error: error.message,
    });
  }
};




export { store, index, update, destroy };