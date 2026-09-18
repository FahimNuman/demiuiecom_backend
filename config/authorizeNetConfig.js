import ApiContracts from "authorizenet/lib/apicontracts.js"; // Import from official SDK
import AuthorizeNetModel from "../models/authorizeNetModel.js"; // Import the model for database access
import dotenv from "dotenv"; // Import dotenv for environment variables

// Load environment variables
dotenv.config();

let authorizeNetInstance = null;

// Function to initialize Authorize.Net with dynamic credentials
export const initializeAuthorizeNet = async (apiLoginId, transactionKey, sandbox = true) => {
  if (!apiLoginId || !transactionKey) {
    // Try to load credentials from environment variables or database if not provided
    const envApiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    const envTransactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    const envSandbox = process.env.AUTHORIZE_NET_SANDBOX === "true";

    if (!envApiLoginId || !envTransactionKey) {
      // Fallback: Load from database
      try {
        const keys = await AuthorizeNetModel.findOne();
        if (!keys) {
          throw new Error("Authorize.Net credentials not found in environment or database.");
        }
        apiLoginId = keys.apiLoginId;
        transactionKey = keys.transactionKey;
        sandbox = keys.sandbox;
      } catch (dbError) {
        throw new Error(`Failed to load Authorize.Net credentials from database: ${dbError.message}`);
      }
    } else {
      apiLoginId = envApiLoginId;
      transactionKey = envTransactionKey;
      sandbox = envSandbox;
    }
  }

  if (!apiLoginId || !transactionKey) {
    throw new Error("Authorize.Net credentials are missing! Cannot initialize Authorize.Net.");
  }

  // Store credentials in an object
  authorizeNetInstance = {
    apiLoginId: apiLoginId,
    transactionKey: transactionKey,
    sandbox: sandbox
  };
  
  console.log("✅ Authorize.Net initialized dynamically with credentials:", {
    apiLoginId: authorizeNetInstance.apiLoginId,
    sandbox: authorizeNetInstance.sandbox
  });
  
  return authorizeNetInstance;
};

// Function to get Authorize.Net instance
export const getAuthorizeNet = () => {
  if (!authorizeNetInstance) {
    throw new Error("Authorize.Net has not been initialized. Call initializeAuthorizeNet first.");
  }
  
  return authorizeNetInstance;
};

// Create a merchant authentication object for API requests
export const createMerchantAuthentication = () => {
  if (!authorizeNetInstance) {
    throw new Error("Authorize.Net has not been initialized. Call initializeAuthorizeNet first.");
  }
  
  // Use ApiContracts from authorizenet SDK
  const merchantAuth = new ApiContracts.MerchantAuthenticationType();
  merchantAuth.setName(authorizeNetInstance.apiLoginId);
  merchantAuth.setTransactionKey(authorizeNetInstance.transactionKey);
  
  return merchantAuth;
};

// Utility function to load or update credentials from the database
export const loadAuthorizeNetCredentials = async () => {
  try {
    const keys = await AuthorizeNetModel.findOne();
    if (!keys) {
      console.warn("No Authorize.Net credentials found in database.");
      return null;
    }

    // Update environment variables if not already set
    if (!process.env.AUTHORIZE_NET_API_LOGIN_ID || !process.env.AUTHORIZE_NET_TRANSACTION_KEY) {
      process.env.AUTHORIZE_NET_API_LOGIN_ID = keys.apiLoginId;
      process.env.AUTHORIZE_NET_TRANSACTION_KEY = keys.transactionKey;
      process.env.AUTHORIZE_NET_SANDBOX = keys.sandbox.toString();
    }

    // Reinitialize Authorize.Net with database credentials
    await initializeAuthorizeNet(keys.apiLoginId, keys.transactionKey, keys.sandbox);
    console.log("✅ Authorize.Net credentials loaded from database and initialized.");
    return keys;
  } catch (error) {
    console.error("❌ Error loading Authorize.Net credentials from database:", error);
    throw error;
  }
};

// Utility function to update credentials in the database and environment
export const updateAuthorizeNetCredentials = async (apiLoginId, transactionKey, sandbox = true) => {
  try {
    let keys = await AuthorizeNetModel.findOne();
    if (keys) {
      keys.apiLoginId = apiLoginId || keys.apiLoginId;
      keys.transactionKey = transactionKey || keys.transactionKey;
      keys.sandbox = sandbox !== undefined ? sandbox : keys.sandbox;
    } else {
      keys = new AuthorizeNetModel({ 
        apiLoginId, 
        transactionKey, 
        sandbox 
      });
    }

    await keys.save();

    // Update environment variables
    process.env.AUTHORIZE_NET_API_LOGIN_ID = keys.apiLoginId;
    process.env.AUTHORIZE_NET_TRANSACTION_KEY = keys.transactionKey;
    process.env.AUTHORIZE_NET_SANDBOX = keys.sandbox.toString();

    // Reinitialize with new credentials
    await initializeAuthorizeNet(keys.apiLoginId, keys.transactionKey, keys.sandbox);
    console.log("✅ Authorize.Net credentials updated successfully.");
    return keys;
  } catch (error) {
    console.error("❌ Error updating Authorize.Net credentials:", error);
    throw error;
  }
};