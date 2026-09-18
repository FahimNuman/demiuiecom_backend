import dotenv from "dotenv";
import ApiContracts from "authorizenet/lib/apicontracts.js"; // Official SDK import
import ApiControllers from "authorizenet/lib/apicontrollers.js"; // Official SDK import
import AuthorizeNetModel from "../models/authorizeNetModel.js";
import { initializeAuthorizeNet } from "../config/authorizeNetConfig.js";
import axios from "axios";

// Load env variables initially
dotenv.config();

export const getAuthorizeNetKeys = async (req, res) => {
  try {
    const keys = await AuthorizeNetModel.findOne();
    if (!keys) {
      return res.status(404).json({ message: "Authorize.Net keys not found" });
    }
    res.json(keys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createTransaction = async (req, res) => {
    try {
        const { 
            amount, 
            cardData, 
            description, 
            customerEmail,
            userId,
            cartIds,
            address
        } = req.body;

        // Validate required fields
        if (!amount || !cardData || !userId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: amount, cardData, and userId are required" 
            });
        }

        // Extract card details
        const { cardNumber, expirationDate, cardCode } = cardData;

        if (!cardNumber || !expirationDate || !cardCode) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required card information" 
            });
        }

        // Format expiration date if needed
        let formattedExpirationDate = expirationDate;
        if (expirationDate.includes('/')) {
            const [month, yearShort] = expirationDate.split('/');
            const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;
            formattedExpirationDate = `${year}-${month.padStart(2, '0')}`;
        }

        // Get API credentials from config
        const { createMerchantAuthentication } = await import("../config/authorizeNetConfig.js");
        const merchantAuth = createMerchantAuthentication();
        
        // Create transaction payload with dynamic data
        const transactionPayload = {
            createTransactionRequest: {
                merchantAuthentication: {
                    name: merchantAuth.getName(),
                    transactionKey: merchantAuth.getTransactionKey()
                },
                transactionRequest: {
                    transactionType: "authCaptureTransaction",
                    amount: amount,
                    payment: {
                        creditCard: {
                            cardNumber: cardNumber,
                            expirationDate: formattedExpirationDate,
                            cardCode: cardCode
                        }
                    },
                    // Add optional fields if provided
                    ...(description && { order: { invoiceNumber: description } }),
                    ...(customerEmail && { customer: { email: customerEmail } })
                }
            }
        };

        console.log("---------------------------..");
        console.log("Sending transaction request...");
    
        const response = await axios.post(
            "https://api.authorize.net/xml/v1/request.api",
            transactionPayload,
            { headers: { "Content-Type": "application/json" } }
        );
    
        console.log("Transaction Response:::", response.data);
    
        // Check if the transaction was successful
        if (response.data?.messages?.resultCode !== "Ok") {
            console.error("Transaction Failed:", JSON.stringify(response.data, null, 2));
            return res.status(400).json({
                success: false,
                message: response.data?.messages?.message?.[0]?.text || "Transaction failed",
                details: response.data
            });
        }
    
        console.log("✅ Transaction Successful!");
        
        // Get transaction details
        const transactionResponse = response.data.transactionResponse;
        const transactionId = transactionResponse?.transId;
        
        // If cartIds are provided, create an order
        if (cartIds && address) {
            try {
                // Import required models and helpers
                const { validateAndCalculateCarts } = await import("../helpers/orderHelpers.js");
                const orderModel = (await import("../models/orderModel.js")).default;
                const cartModel = (await import("../models/cartModel.js")).default;
    
                // Validate and recalculate totals to prevent tampering
                const { items: carts, total } = await validateAndCalculateCarts(cartIds, userId);
    
                // Create the order
                const newOrder = new orderModel({
                    user: userId,
                    carts: Array.isArray(carts) ? carts : [],
                    total: total || amount, // Use calculated total or amount
                    address,
                    paymentDetails: {
                        method: "Authorize.Net",
                        transactionId: transactionId
                    },
                    status: "processing"
                });
    
                await newOrder.save();
    
                // Remove selected carts
                await cartModel.deleteMany({ _id: { $in: cartIds } });
    
                return res.status(201).json({
                    success: true,
                    message: "Transaction successful and order created",
                    order: newOrder,
                    transactionId: transactionId,
                    authCode: transactionResponse?.authCode
                });
            } catch (orderError) {
                console.error("Error creating order:", orderError);
                return res.status(200).json({
                    success: true,
                    message: "Transaction successful but order creation failed",
                    transactionId: transactionId,
                    error: orderError.message
                });
            }
        }
        
        // Return transaction details if no order is created
        return res.status(200).json({
            success: true,
            message: "Transaction successful",
            transactionId: transactionId,
            authCode: transactionResponse?.authCode,
            responseCode: transactionResponse?.responseCode,
            responseDetails: transactionResponse
        });
    
    } catch (error) {
        console.error("Transaction Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Unable to process transaction", 
            error: error.message 
        });
    }
};

// Create a transaction with Authorize.Net
export const createTransaction_old = async (req, res) => {
  try {
    const { 
      amount, 
      cardData, 
      description, 
      customerEmail,
      userId,
      cartIds,
      address
    } = req.body;

    // Extract card details from cardData
    const cardNumber = cardData?.cardNumber;
    const expirationDate = cardData?.expirationDate;
    const cardCode = cardData?.cardCode;

    console.log("Create transaction request received:", { 
      userId, 
      amount, 
      cardNumberLength: cardNumber ? cardNumber.length : 0,
      expirationDate,
      cartIds: cartIds ? cartIds.length : 0
    });

    if (!cardNumber || !expirationDate || !cardCode || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required payment information" 
      });
    }

    // Format expiration date to YYYY-MM (Authorize.net expects this)
    let formattedExpirationDate = expirationDate;
    if (expirationDate.includes('/')) {
      const [month, yearShort] = expirationDate.split('/');
      const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;
      formattedExpirationDate = `${year}-${month.padStart(2, '0')}`;
    }

    // Create merchant authentication
    const merchantAuth = new ApiContracts.MerchantAuthenticationType();
    merchantAuth.setName("97eGg27fAN");
    merchantAuth.setTransactionKey("8c795heMXtt879GZ");

    // Create credit card object
    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(formattedExpirationDate); // e.g., "2025-12"
    creditCard.setCardCode(cardCode);

    // Create payment object
    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    // Create transaction request
    const transactionRequest = new ApiContracts.TransactionRequestType();
    transactionRequest.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setAmount(amount);
    transactionRequest.setPayment(paymentType);
    if (description) {
      transactionRequest.setOrder({ invoiceNumber: description });
    }
    if (customerEmail) {
      transactionRequest.setCustomer({ email: customerEmail });
    }

    // Create the full request
    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuth);
    createRequest.setTransactionRequest(transactionRequest);

    // Execute the transaction
    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    if (process.env.AUTHORIZE_NET_SANDBOX === "true") {
      ctrl.setEnvironment('SANDBOX'); // Use sandbox for testing
    }

    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      if (!apiResponse) {
        console.error("No response from Authorize.net");
        return res.status(500).json({
          success: false,
          message: "No response from Authorize.net"
        });
      }

      if (apiResponse.messages.resultCode === ApiContracts.MessageTypeEnum.OK) {
        const transactionResponse = apiResponse.getTransactionResponse();
        console.log("Transaction approved:", transactionResponse);
        res.status(200).json({
          success: true,
          transactionId: transactionResponse.getTransId(),
          authCode: transactionResponse.getAuthCode(),
          message: `Transaction successful with ID: ${transactionResponse.getTransId()}`
        });
      } else {
        const errorMessage = apiResponse.messages.message[0]?.text || "Transaction failed";
        console.error("Transaction not approved:", apiResponse);
        res.status(400).json({
          success: false,
          message: errorMessage,
          details: apiResponse.getTransactionResponse?.() || apiResponse
        });
      }
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ 
      success: false, 
      message: "Unable to create transaction", 
      error: error.message
    });
  }
};

export const updateAuthorizeNetKeys = async (req, res) => {
  try {
    const { apiLoginId, transactionKey, sandbox } = req.body;
    let keys = await AuthorizeNetModel.findOne();

    if (keys) {
      keys.apiLoginId = apiLoginId || keys.apiLoginId;
      keys.transactionKey = transactionKey || keys.transactionKey;
      if (sandbox !== undefined) keys.sandbox = sandbox;
    } else {
      keys = new AuthorizeNetModel({ 
        apiLoginId, 
        transactionKey, 
        sandbox: sandbox !== undefined ? sandbox : true 
      });
    }

    await keys.save();

    // Update environment variables after saving new keys
    process.env.AUTHORIZE_NET_API_LOGIN_ID = keys.apiLoginId;
    process.env.AUTHORIZE_NET_TRANSACTION_KEY = keys.transactionKey;
    process.env.AUTHORIZE_NET_SANDBOX = keys.sandbox.toString();

    res.json({ message: "Authorize.Net keys updated successfully", keys });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Load Authorize.Net Keys to Environment Variables at Server Startup
export const loadAuthorizeNetKeysToEnv = async () => {
  try {
    // First check if keys are in environment variables
    const envApiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID;
    const envTransactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
    const envSandbox = process.env.AUTHORIZE_NET_SANDBOX;
    
    if (envApiLoginId && envTransactionKey) {
      // Initialize with environment variables
      initializeAuthorizeNet(
        envApiLoginId, 
        envTransactionKey, 
        envSandbox === "true"
      );
      console.log("✅ Authorize.Net initialized with environment variables.");
      
      // Also save to database if not already there
      let keys = await AuthorizeNetModel.findOne();
      if (!keys) {
        keys = new AuthorizeNetModel({
          apiLoginId: envApiLoginId,
          transactionKey: envTransactionKey,
          sandbox: envSandbox === "true"
        });
        await keys.save();
        console.log("✅ Authorize.Net keys saved to database.");
      }
    } else {
      // Try to load from database
      const keys = await AuthorizeNetModel.findOne();
      if (keys) {
        process.env.AUTHORIZE_NET_API_LOGIN_ID = keys.apiLoginId;
        process.env.AUTHORIZE_NET_TRANSACTION_KEY = keys.transactionKey;
        process.env.AUTHORIZE_NET_SANDBOX = keys.sandbox.toString();
        
        initializeAuthorizeNet(
          keys.apiLoginId, 
          keys.transactionKey, 
          keys.sandbox
        );
        console.log("✅ Authorize.Net keys loaded from database.");
      } else {
        console.warn("⚠️ Authorize.Net keys not found in database or environment.");
      }
    }
  } catch (error) {
    console.error("❌ Error loading Authorize.Net keys:", error);
  }
};

// Process a payment with Authorize.Net
export const processPayment = async (req, res) => {
  try {
    const { cardNumber, expirationDate, cardCode, amount, description, customerEmail } = req.body;
    
    if (!cardNumber || !expirationDate || !cardCode || !amount) {
      return res.status(400).json({ message: "Missing required payment information" });
    }
    
    // Convert expiration date from MM/YY to YYYY-MM format
    let formattedExpirationDate = expirationDate;
    if (expirationDate.includes('/')) {
      const [month, yearShort] = expirationDate.split('/');
      const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;
      formattedExpirationDate = `${year}-${month.padStart(2, '0')}`;
    }
    
    console.log(`Original expiration date: ${expirationDate}, Formatted: ${formattedExpirationDate}`);
    
    // Create merchant authentication
    const merchantAuth = new ApiContracts.MerchantAuthenticationType();
    merchantAuth.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID);
    merchantAuth.setTransactionKey(process.env.AUTHORIZE_NET_TRANSACTION_KEY);

    // Create credit card object
    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(formattedExpirationDate);
    creditCard.setCardCode(cardCode);

    // Create payment object
    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    // Create transaction request
    const transactionRequest = new ApiContracts.TransactionRequestType();
    transactionRequest.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setAmount(amount);
    transactionRequest.setPayment(paymentType);
    if (description) {
      transactionRequest.setOrder({ invoiceNumber: description });
    }
    if (customerEmail) {
      transactionRequest.setCustomer({ email: customerEmail });
    }

    // Create the full request
    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuth);
    createRequest.setTransactionRequest(transactionRequest);

    // Execute the transaction
    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    if (process.env.AUTHORIZE_NET_SANDBOX === "true") {
      ctrl.setEnvironment('SANDBOX');
    }

    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      if (!apiResponse) {
        console.error("No response from Authorize.net");
        return res.status(500).json({
          success: false,
          message: "No response from Authorize.net"
        });
      }

      if (apiResponse.messages.resultCode === ApiContracts.MessageTypeEnum.OK) {
        const transactionResponse = apiResponse.getTransactionResponse();
        res.status(200).json({
          success: true,
          transactionId: transactionResponse.getTransId(),
          authCode: transactionResponse.getAuthCode(),
          message: `Transaction successful with ID: ${transactionResponse.getTransId()}`
        });
      } else {
        const errorMessage = apiResponse.messages.message[0]?.text || "Transaction failed";
        console.error("Transaction not approved:", apiResponse);
        res.status(400).json({
          success: false,
          message: errorMessage,
          details: apiResponse.getTransactionResponse?.() || apiResponse
        });
      }
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Unable to process payment", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Process payment and create order
export const processPaymentAndCreateOrder = async (req, res) => {
  try {
    const { 
      cardNumber, 
      expirationDate, 
      cardCode, 
      amount, 
      description, 
      customerEmail,
      userId,
      cartIds,
      address
    } = req.body;
    
    if (!cardNumber || !expirationDate || !cardCode || !amount || !userId || !cartIds || !address) {
      return res.status(400).json({ message: "Missing required information" });
    }
    
    // Convert expiration date from MM/YY to YYYY-MM format
    let formattedExpirationDate = expirationDate;
    if (expirationDate.includes('/')) {
      const [month, yearShort] = expirationDate.split('/');
      const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;
      formattedExpirationDate = `${year}-${month.padStart(2, '0')}`;
    }
    
    console.log(`Original expiration date: ${expirationDate}, Formatted: ${formattedExpirationDate}`);
    
    // Create merchant authentication
    const merchantAuth = new ApiContracts.MerchantAuthenticationType();
    merchantAuth.setName(process.env.AUTHORIZE_NET_API_LOGIN_ID);
    merchantAuth.setTransactionKey(process.env.AUTHORIZE_NET_TRANSACTION_KEY);

    // Create credit card object
    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cardNumber);
    creditCard.setExpirationDate(formattedExpirationDate);
    creditCard.setCardCode(cardCode);

    // Create payment object
    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    // Create transaction request
    const transactionRequest = new ApiContracts.TransactionRequestType();
    transactionRequest.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequest.setAmount(amount);
    transactionRequest.setPayment(paymentType);
    if (description) {
      transactionRequest.setOrder({ invoiceNumber: description });
    }
    if (customerEmail) {
      transactionRequest.setCustomer({ email: customerEmail });
    }

    // Create the full request
    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuth);
    createRequest.setTransactionRequest(transactionRequest);

    // Execute the transaction
    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    if (process.env.AUTHORIZE_NET_SANDBOX === "true") {
      ctrl.setEnvironment('SANDBOX');
    }

    ctrl.execute(async () => {
      try {
        const apiResponse = ctrl.getResponse();
        if (!apiResponse) {
          console.error("No response from Authorize.net");
          return res.status(500).json({
            success: false,
            message: "No response from Authorize.net"
          });
        }

        if (apiResponse.messages.resultCode === ApiContracts.MessageTypeEnum.OK) {
          const transactionResponse = apiResponse.getTransactionResponse();
          const transactionId = transactionResponse.getTransId();

          // Import required models and helpers
          const { validateAndCalculateCarts } = await import("../helpers/orderHelpers.js");
          const orderModel = (await import("../models/orderModel.js")).default;
          const cartModel = (await import("../models/cartModel.js")).default;

          // Validate and recalculate totals to prevent tampering
          const { items: carts, total } = await validateAndCalculateCarts(cartIds, userId);

          // Create the order
          const newOrder = new orderModel({
            user: userId,
            carts: Array.isArray(carts) ? carts : [],
            total,
            address,
            paymentDetails: {
              method: "Authorize.Net",
              transactionId: transactionId
            },
            status: "processing"
          });

          await newOrder.save();

          // Remove selected carts
          await cartModel.deleteMany({ _id: { $in: cartIds } });

          res.status(201).json({
            success: true,
            message: "Payment processed and order created successfully",
            order: newOrder,
            transactionId: transactionId,
            authCode: transactionResponse.getAuthCode()
          });
        } else {
          const errorMessage = apiResponse.messages.message[0]?.text || "Transaction failed";
          console.error("Transaction not approved:", apiResponse);
          res.status(400).json({
            success: false,
            message: errorMessage,
            details: apiResponse.getTransactionResponse?.() || apiResponse
          });
        }
      } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ 
          success: false, 
          message: "Payment was processed but order creation failed",
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Unable to process payment", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
