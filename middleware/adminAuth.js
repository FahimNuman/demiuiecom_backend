import jwt from "jsonwebtoken"
import adminModel from "../models/adminModel.js";
import mongoose from "mongoose";

const adminAuth = async (req, res, next) => {
    try {

        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1]; // Bearer 

            console.log("token", token);
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            console.log("decodedToken", decodedToken);

            const userInfo = await adminModel.findOne({ _id: decodedToken.id });

            console.log("userInfo", userInfo);

            if(!userInfo){
                return res.json({   
                    status: false,
                    message: 'Invalid or expired token provided!',
                });
            }

            req.adminData = decodedToken;
            next();
        } else {
            return res.json({
                status: false,
                message: 'Authorization token is required!',
            });
        }


    } catch (error) {
        console.log("ERROR", error);
        return res.json({
            status: false,
            isSessionExpired: true,
            message: 'Invalid or expired token provided!',
            error: error,
        });
    }
}

export default adminAuth;