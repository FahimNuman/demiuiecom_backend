import { stat } from "fs";
import roleModel from "../models/roleModel.js";
import taskModel from "../models/taskModel.js";
import processModel from "../models/processModel.js";
import taskWorkModel from "../models/taskWorkModel.js";
import taskGroupModel from "../models/taskGroupModel.js";

import bcrypt from "bcrypt";
import cloudinary from "../helpers/CloudinaryConfig.js";
import settingModel from "../models/settingModel.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";
import policyModel from "../models/policyModel.js";
import { getAdminToken } from "../helpers/AdminToken.js";

// Helper function to upload a file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
};



const index = async (req, res) => {
    try {
        const decodedToken = getAdminToken(req);
        const userId = decodedToken.id;
        console.log("userId:", userId);

        const tasks = await taskModel.find({})
            .populate("processId")
            .lean();

        for (const task of tasks) {
            const groups = await taskGroupModel.find({
                taskId: task._id,
                admins: userId
            })
                .populate("admins")
                .populate("processId")
                .lean();

            const groupIds = groups.map(g => g._id);

            const works = await taskWorkModel.find({
                taskId: task._id,
                groupId: { $in: groupIds }
            })
                .populate("groupId")
                .populate("processId")
                .lean();

            task.groups = groups;
            task.works = works;
        }

        return res.json({ status: "success", data: tasks });

    } catch (error) {
        console.error("Error fetching tasks:", error.message);

        if (error.message === "jwt expired") {
            return res.status(401).json({
                status: "error",
                message: "Session expired. Please login again.",
            });
        }

        if (error.message === "No token provided" || error.message === "invalid signature") {
            return res.status(401).json({
                status: "error",
                message: "Invalid or missing token.",
            });
        }

        return res.status(500).json({
            status: "error",
            message: "Something went wrong while fetching tasks.",
            error: error.message,
        });
    }
};


const indexx = async (req, res) => {
    const decodedToken = getAdminToken(req, res);
    let userId = decodedToken.id;
    console.log("userId:", userId);
    try {
        const tasks = await taskModel.find({})
            .populate("processId")
            // .populate("adminId")
            .lean();

        for (const task of tasks) {
            // groups → only those where current user is an admin
            const groups = await taskGroupModel.find({
                taskId: task._id,
                admins: userId
            })
                .populate("admins")
                .populate("processId")
                .lean();

            // extract groupIds where user is admin
            const groupIds = groups.map(g => g._id);

            // works → only for those groups where user is admin
            const works = await taskWorkModel.find({
                taskId: task._id,
                groupId: { $in: groupIds }
            })
                .populate("groupId")
                .populate("processId")
                .lean();

            task.groups = groups;
            task.works = works;
        }

        res.json({ status: "success", data: tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).json({
            status: "error",
            message: "Something went wrong while fetching tasks.",
            error: error.message,
        });
    }
};


const getTask = async (req, res) => {
    const decodedToken = getAdminToken(req, res);
    const userId = decodedToken.id;

    try {
        const processes = await processModel.find({ admins: userId }).lean();

        for (const process of processes) {
            const tasks = await taskModel.find({ processId: process._id }).lean();

            for (const task of tasks) {
                const groups = await taskGroupModel.find({ taskId: task._id, admins: userId })
                    .populate("admins")
                    .populate("processId")
                    .lean();


                const works = await taskWorkModel.find({ taskId: task._id })
                    .populate("groupId")
                    .populate("processId")
                    .lean();



                task.groups = groups;
                task.works = works;
            }

            process.tasks = tasks;
        }

        res.json({ status: "success", data: processes });
    } catch (error) {
        console.error("Error fetching processes:", error.message);
        res.status(500).json({
            status: "error",
            message: "Something went wrong while fetching processes.",
            error: error.message,
        });
    }
};

const store = async (req, res) => {
    try {
        const { processId, name, description, priority, groups } = req.body;

        // 1. Create Task
        const task = await taskModel.create({
            processId,
            name,
            description,
            priority,
        });

        // collect all userIds from groups
        let allUserIds = [];
        for (const group of groups) {
            const userIds = group.users.map((u) => u.id);
            allUserIds = [...allUserIds, ...userIds];

            const taskGroup = await taskGroupModel.create({
                taskId: task._id,
                processId,
                name: group.name,
                admins: userIds,
            });

            await taskWorkModel.create({
                processId,
                taskId: task._id,
                groupId: taskGroup._id,
                instruction: group.workDescription,
                startTime: group.startTime,
                endTime: group.endTime,
                location: group.location,
                labelName: group.customInputFields.map((f) => ({
                    label: f.value,
                    value: "",
                })),
                attachment: group.attachments.map((a) => ({
                    label: a.name,
                    value: "",
                })),
            });
        }

        // 3. Update Process admins (avoid duplicates with $addToSet + $each)
        await processModel.findByIdAndUpdate(processId, {
            $addToSet: { admins: { $each: allUserIds } }
        });

        res.json({
            status: 'success',
            message: "Task created successfully",
            data: task,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error creating task",
            error: err.message,
        });
    }
};


const updateWork = async (req, res) => {
    try {
        const { labels, taskId, attachmentMeta, workId } = req.body;

        if (!workId || !labels) {
            return res.json({
                status: "error",
                message: "Missing workId or labels in request."
            });
        }

        const updatedLabels = JSON.parse(labels);
        const parsedAttachmentMeta = attachmentMeta ? JSON.parse(attachmentMeta) : [];

        const taskWork = await taskWorkModel.findById(workId);

        if (req.files && req.files.length > 0) {
            if (req.files.length !== parsedAttachmentMeta.length) {
                return res.json({
                    status: "error",
                    message: "File count does not match attachment metadata count."
                });
            }

            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const meta = parsedAttachmentMeta[i];
                const attachmentId = meta.attachmentId;

                const result = await uploadToCloudinary(file.buffer);
                const imageUrl = result.secure_url;

                const attachment = taskWork.attachment.id(attachmentId);

                if (attachment) {
                    attachment.value = imageUrl; // update only
                }
            }
            await taskWork.save();
        }

        // Update label values
        if (updatedLabels && updatedLabels.length > 0) {
            for (let i = 0; i < updatedLabels.length; i++) {
                const labelUpdate = updatedLabels[i];
                const labelInDb = taskWork.labelName.id(labelUpdate._id);

                if (labelInDb) {
                    taskWork.labelName.id(labelUpdate._id).value = labelUpdate.value;
                    await taskWork.save();
                }
            }
        }

        // task status update

        await taskModel.findOneAndUpdate(
            { _id: taskId },
            { $set: { status: "pending" } },
            { new: true }
        );

        res.json({
            status: "success",
            message: "Work updated successfully."
        });

    } catch (error) {
        console.error("Error in updateWork:", error);
        res.json({
            message: "Error updating work.", error: error.message
        });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { taskId, status } = req.body;

        // console.log("req.body", req.body);

        if (!taskId || !status) {
            return res.status(400).json({
                status: "error",
                message: "Missing taskId or status in request body.",
            });
        }

        const updatedTask = await taskModel.findByIdAndUpdate(
            taskId,
            { $set: { status: status } },
            { new: true } // Returns the updated document
        );

        if (!updatedTask) {
            return res.status(404).json({
                status: "error",
                message: "Task not found.",
            });
        }

        return res.json({
            status: "success",
            message: "Task status updated successfully.",
            data: updatedTask,
        });

    } catch (error) {
        console.error("Error updating task status:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while updating the task status.",
            error: error.message,
        });
    }
};


const destroy = async (req, res) => {
    // Not implemented
};


const taskWorkDeletey = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("id to delete:", id);
        process.exit();

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Missing workId in request parameters.",
            });
        }

        const deletedWork = await taskWorkModel.findByIdAndDelete(id);

        if (!deletedWork) {
            return res.status(404).json({
                status: "error",
                message: "Task work not found.",
            });
        }

        return res.json({
            status: "success",
            message: "Task work deleted successfully.",
            data: deletedWork,
        });

    } catch (error) {
        console.error("Error deleting task work:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while deleting the task work.",
            error: error.message,
        });
    }
};


const taskGroupDelete = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                message: "Missing groupId in request parameters.",
            });
        }

        // Delete the group
        const deletedGroup = await taskGroupModel.findByIdAndDelete(id);

        // Delete all works related to this group
        const deletedWorks = await taskWorkModel.deleteMany({ groupId: id });

        if (!deletedGroup) {
            return res.status(404).json({
                status: "error",
                message: "Task group not found.",
            });
        }

        return res.json({
            status: "success",
            message: "Task group and related works deleted successfully.",
            data: {
                deletedGroup,
                deletedWorksCount: deletedWorks.deletedCount
            }
        });
    } catch (error) {
        console.error("Error deleting task group:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Something went wrong while deleting the task group.",
            error: error.message,
        });
    }

};

export { store, index, destroy, getTask, updateWork, updateTaskStatus, taskWorkDeletey, taskGroupDelete };