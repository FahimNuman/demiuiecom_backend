import express from "express";
import { store, index, storeLanguage, getLanguage, storeCurrency, getCurrency, storeTimezone, getTimezone } from "../controllers/countryController.js";

const countryRouter = express.Router();

countryRouter.get("/index", index);
countryRouter.get("/add", store);
countryRouter.get("/store-language", storeLanguage);
countryRouter.get("/get-language", getLanguage);
countryRouter.get("/store-currency", storeCurrency);
countryRouter.get("/get-currency", getCurrency);

countryRouter.get("/store-timezone", storeTimezone);
countryRouter.get("/get-timezone", getTimezone);
// adminRouter.post("/update", update);

export default countryRouter;
