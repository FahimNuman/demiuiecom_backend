import express from "express";
import { store, index, update, destroy } from "../controllers/policyController.js";


const policyRouter = express.Router();

policyRouter.get("/index", index);
policyRouter.post("/add", store);
policyRouter.post("/update", update);
policyRouter.delete("/delete/:id", destroy);

export default policyRouter;
