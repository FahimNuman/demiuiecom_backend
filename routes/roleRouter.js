import express from "express";
import { store, index, update, destroy } from "../controllers/roleController.js";


const roleRouter = express.Router();

roleRouter.get("/index", index);
roleRouter.post("/add", store);
roleRouter.post("/update", update);
roleRouter.delete("/delete/:id", destroy);

export default roleRouter;
