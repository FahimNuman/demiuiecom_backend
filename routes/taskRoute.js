import express from "express";
import { store, index, destroy, getTask, updateWork, updateTaskStatus, taskWorkDeletey, taskGroupDelete } from "../controllers/taskController.js";
// import { store, index, destroy } from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const taskRouter = express.Router();

taskRouter.get("/index", index);
// taskRouter.get("/index", getTask);

taskRouter.post("/add", upload.single("image"), store);

taskRouter.post("/update-work", upload.any(), updateWork);

taskRouter.post("/create", store);

taskRouter.post("/task-status-update", updateTaskStatus);


// taskRouter.post("/add", store);
// taskRouter.post("/update", update);
taskRouter.delete("/delete/:id", taskGroupDelete);
// taskRouter.delete("work/delete/:id", taskWorkDeletey);

export default taskRouter;
