import express from "express";
import {
  addBulkProducts,
  addProduct,
  getProducts,
  removeProduct,
  removeSingleProduct,
  singleProduct,
  updateProduct,
  addInventory,
  sentMail
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// Route for adding a product (single image upload)
// productRouter.post(
//   "/add",
//   // adminAuth,
//   addProduct
// );
// Allow all file uploads dynamically
productRouter.post(
  "/add",
  upload.any(), // Allows uploading files with any field name
  addProduct
);

// Route for adding bulk products
productRouter.post(
  "/bulk-add",
  // adminAuth,
  addBulkProducts
);

// Route for removing a product (requires admin authentication)
productRouter.post("/remove", removeProduct); // Changed to DELETE

// Route for listing all products
productRouter.get("/list", getProducts);
productRouter.put('/api/product/update/:id', updateProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/:id", getProducts);
productRouter.delete("/:id", removeSingleProduct);

productRouter.post("/sent-mail", sentMail);

productRouter.post("/addInventory", addInventory);

export default productRouter;
