import express from "express";
import {
  adminLogin,
  listUser,
  loginUser,
  registerBusinessUser,
  registerUser,
  getUserDetails,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/registration", registerBusinessUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
// Route for listing users
userRouter.get("/list", listUser);
userRouter.get("/me", getUserDetails);

export default userRouter;
