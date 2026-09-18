import policyModel from "../models/policyModel.js";


const index = async (req, res) => {
    try {
        const policy = await policyModel.find({});

        console.log("Policy Data:", policy);
        
        res.json({ status: "success", data: policy });
    } catch (error) {
        console.error("Error fetching roles:", error.message);
        res.json({
            status: "error",
            message: "Something went wrong while fetching policy.",
            error: error.message,
        });
    }
};

const store = async (req, res) => {
  try {
    const { name, description, isActive } = req.body.data;

    if (!name) {
      return res.json({ status: 'error', message: "Policy name is required." });
    }

    // ✅ Check if role name already exists
    const existingPolicy = await policyModel.findOne({ name: name.trim() });
    if (existingPolicy) {
      return res.json({ status: 'error', message: "Policy name already exists." });
    }

    const policy = new policyModel({
      name: name.trim(),
      description,
      isActive,
    });

    const result = await policy.save();

    res.json({
      status: "success",
      message: "Policy created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error creating role:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while creating the Policy.",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id, data } = req.body;
    const { name, description, isActive } = data;

    const policy = await policyModel.findById(id);

    if (!policy) {
      return res.json({ status: 'error', message: "Role not found." });
    }

    const duplicate = await policyModel.findOne({ name: name.trim(), _id: { $ne: id } });
    if (duplicate) {
      return res.json({ status: "error", message: "Policy name already exists." });
    }

    policy.name = name.trim();
    policy.description = description;
    policy.isActive = isActive;

    const result = await policy.save();

    res.json({
      status: "success",
      message: "Policy updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error updating role:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while updating the Policy.",
      error: error.message,
    });
  }
};


const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await policyModel.findByIdAndDelete(id);
    res.json({
      status: "success",
      message: "Policy deleted successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting role:", error.message);
    res.json({
      status: "error",
      message: "Something went wrong while deleting the policy.",
      error: error.message,
    });
  }
};




export { store, index, update, destroy };