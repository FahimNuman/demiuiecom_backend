import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mogodb.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import sizeRouter from "./routes/sizeRoute.js";
import colorRouter from "./routes/colorRoute.js";
import cartRouter from "./routes/cartRouter.js";
import imageRouter from "./routes/imageRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import orderRouter from "./routes/orderRouter.js";
import excelRouter from "./routes/excelRouter.js";
import bodyParser from "body-parser";
import stripeRouter from "./routes/stripeRouter.js";
import stripeSettingRouter from "./routes/stripeSettingRouter.js";
import authorizeNetRouter from "./routes/authorizeNetRouter.js";
import { loadStripeKeysToEnv } from "./controllers/stripeController.js"; // Load function
import { loadAuthorizeNetKeysToEnv } from "./controllers/authorizeNetController.js"; // Load Authorize.Net function
import vendorRouter from "./routes/vendorRoute.js";
import invoiceRouter from "./routes/invoiceRoute.js";
import settingRouter from "./routes/settingRouter.js";
import roleRouter from "./routes/roleRouter.js";
import processRouter from "./routes/processRouter.js";
import adminRouter from "./routes/adminRoute.js";
import taskRouter from "./routes/taskRoute.js";
import countryRouter from "./routes/countryRouter.js";
import policyRouter from "./routes/policyRouter.js";

// App configuration
const app = express();
const port = process.env.PORT || 4000;

// Connect to the database
connectDB();

// Load Payment Gateway Keys from Database
(async () => {
  await loadStripeKeysToEnv(); // ✅ Ensure Stripe keys are loaded before handling requests
  console.log("Stripe Keys Loaded to Environment Variables");
  
  await loadAuthorizeNetKeysToEnv(); // ✅ Ensure Authorize.Net keys are loaded before handling requests
  console.log("Authorize.Net Keys Loaded to Environment Variables");
})();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.json({ limit: "50mb" })); // Increase limit to 50MB
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Middleware for handling JSON and raw data
// app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "50mb" }));

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/invoice", invoiceRouter);

app.use("/api/roles", roleRouter);
app.use("/api/process", processRouter);

app.use("/api/policy", policyRouter);
app.use("/api/admin", adminRouter);

app.use("/api/task", taskRouter);

app.use("/api/country", countryRouter);

app.use("/api/size", sizeRouter);
app.use("/api/color", colorRouter);
app.use("/api/category", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/upload", imageRouter);
app.use("/api/getAllImages", imageRouter);
app.use("/api/orders", orderRouter);
app.use("/api/images", imageRouter);
app.use("/api/excel", excelRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/stripe", stripeSettingRouter);
app.use("/api/authorize-net", authorizeNetRouter);
app.use("/api/vendor", vendorRouter);
app.use("/api/setting", settingRouter);
// app.use("/api/invoice", invoiceRouter);
// app.use("/api/invoiceItem", invoiceItemRouter);




// Root endpoint
app.get("/", (req, res) => {
  res.send("API Working");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
