import express from "express";
import { store, index, update, destroy } from "../controllers/processController.js";


const processRouter = express.Router();

processRouter.get("/index", index);
processRouter.post("/add", store);
processRouter.post("/update", update);
processRouter.delete("/delete/:id", destroy);

export default processRouter;
