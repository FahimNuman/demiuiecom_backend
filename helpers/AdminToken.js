import jwt from "jsonwebtoken";

/**
 * Extract and verify token
 * @param {Object} req - Express.js request object
 * @returns {Object} Decoded token data
 * @throws {Error} If token is missing or invalid
 */
const getAdminToken = (req) => {
    const token = req.headers['authorization']?.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;  

    if (!token) {
        throw new Error("No token provided");
    }

    try {
        const decodedToken = jwt.verify(token, secretKey);
        return decodedToken;
    } catch (error) {
        throw new Error(error.message); // "jwt expired" or "invalid signature"
    }
};

export { getAdminToken };



// import jwt from "jsonwebtoken";

// /**
//  * Verify token from request headers
//  * @param {Object} req - Express.js request object
//  * @returns {Object} Decoded token data or error response
//  */
// const getAdminTokenOld = (req) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     const secretKey = process.env.JWT_SECRET;  
//     try {
//         const decodedToken = jwt.verify(token, secretKey); 
//         // console.log("Decoded Token Data:", decodedToken);
//         return decodedToken;
//     } catch (error) {
//         console.error("Token verification failed:", error.message);
//         return res.status(401).json({
//             status: false, 
//             message: "Invalid token" 
//         });
//     }
// }


// const getAdminToken = (req, res) => {
//     const token = req.headers['authorization']?.split(' ')[1];
//     const secretKey = process.env.JWT_SECRET;  

//     if (!token) {
//         return res.status(401).json({ status: false, message: "No token provided" });
//     }

//     try {
//         const decodedToken = jwt.verify(token, secretKey); 
//         return decodedToken;
//     } catch (error) {
//         console.error("Token verification failed:", error.message);
//         return res.status(401).json({ status: false, message: "Invalid token" });
//     }
// }

// export { getAdminToken };
