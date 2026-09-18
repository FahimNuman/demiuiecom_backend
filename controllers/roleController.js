import { stat } from "fs";
import roleModel from "../models/roleModel.js";


const index = async (req, res) => {
    try {
        const roles = await roleModel.find({});
        res.json({ status: "success", data: roles });
    } catch (error) {
        console.error("Error fetching roles:", error.message);
        res.json({
            status: "error",
            message: "Something went wrong while fetching roles.",
            error: error.message,
        });
    }
};

const store = async (req, res) => {
  try {
    const { name, description, isActive } = req.body.data;

    if (!name) {
      return res.json({ status: 'error', message: "Role name is required." });
    }

    // ✅ Check if role name already exists
    const existingRole = await roleModel.findOne({ name: name.trim() });
    if (existingRole) {
      return res.json({ status: 'error', message: "Role name already exists." });
    }

    const role = new roleModel({
      name: name.trim(),
      description,
      isActive,
    });

    const result = await role.save();

    res.json({
      status: "success",
      message: "Role created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error creating role:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while creating the role.",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id, data } = req.body;
    const { name, description, isActive } = data;

    const role = await roleModel.findById(id);

    if (!role) {
      return res.json({ status: 'error', message: "Role not found." });
    }

    const duplicate = await roleModel.findOne({ name: name.trim(), _id: { $ne: id } });
    if (duplicate) {
      return res.json({ status: "error", message: "Role name already exists." });
    }

    role.name = name.trim();
    role.description = description;
    role.isActive = isActive;

    const result = await role.save();

    res.json({
      status: "success",
      message: "Role updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error updating role:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while updating the role.",
      error: error.message,
    });
  }
};


const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await roleModel.findByIdAndDelete(id);
    res.json({
      status: "success",
      message: "Role deleted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting role:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while deleting the role.",
      error: error.message,
    });
  }
};




export { store, index, update, destroy };