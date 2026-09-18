import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";
import settingModel from "../models/settingModel.js";

// Create JWT Token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" }); // Added token expiry
};

// User Login Route
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not Exist  " });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// User Register Route
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Checking if user already exists
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Validate email and password
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a strong password" });
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// List Users Route
const listUser = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password"); // Exclude the password field

    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Add other fields as needed
    }));

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin Login Route
const adminLoginOld = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASS
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: "Invalid credentials" });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password are required." });
  }

  try {
    // Find admin by email
    const admin = await adminModel.findOne({ email }).populate("role");

    if (!admin) {
      return res.status(401).json({ status: "error", message: "Invalid credentials." });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid credentials." });
    }

    const setting = await settingModel.findOne({});
    let expiresIn = "1d"; 
    if (setting.expairTime) {
      expiresIn = setting.expairTime + setting.sessionUnit; // example: 7 → "7d"
    }

    // console.log("setting", setting.expairTime);
    // process.exit();

    // Create JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: "1d" } // expires in 1 day
    );

    // Send response
    res.json({
      status: "success",
      message: "Login successful.",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ status: "error", message: "Something went wrong.", error: error.message });
  }
};

export const registerBusinessUser = async (req, res) => {
  try {
    const {
      // Step 1
      companyDetails,
      billingDetails,
      shippingDetails,
      // Step 2
      businessInformation,
      productDecoration,
      preferences,
      // Step 3
      name,
      email,
      password,
      userDetails,
      marketingPreferences,
    } = req.body;

    // Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with all details
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      companyDetails,
      billingDetails,
      shippingDetails,
      businessInformation,
      productDecoration,
      preferences,
      userDetails,
      marketingPreferences,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        companyName: user.companyDetails.companyName,
        // You can add more fields as needed in the response
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details (excluding password)
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user details
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        companyDetails: user.companyDetails,
        billingDetails: user.billingDetails,
        shippingDetails: user.shippingDetails,
        businessInformation: user.businessInformation,
        productDecoration: user.productDecoration,
        preferences: user.preferences,
        userDetails: user.userDetails,
        marketingPreferences: user.marketingPreferences,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// login
export { loginUser, registerUser, adminLogin, listUser };
