import { stat } from "fs";
import roleModel from "../models/roleModel.js";
import adminModel from "../models/adminModel.js";
import bcrypt from "bcrypt";
import cloudinary from "../helpers/CloudinaryConfig.js";
import settingModel from "../models/settingModel.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";
import policyModel from "../models/policyModel.js";

const index = async (req, res) => {


    try {
        const admins = await adminModel.find({}).populate("role");
        res.json({ status: "success", data: admins });
    } catch (error) {
        console.error("Error fetching admins:", error.message);
        res.json({
            status: "error",
            message: "Something went wrong while fetching roles.",
            error: error.message,
        });
    }
};

const store = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            confirmPassword,
            role,
            isActive,
            dob,
            company,
            phoneNumber,
            alternativeEmail,
            whatsapp,
            linkedin,
            facebook,
            instagram,
            username,
            team,
            securityAnswer,
            twoFactorMethod,
            country,
            timeZone,
            preferredLanguage,
            currencyPreference,
            agreedToPolicies,
            policyModal // <-- Expecting policyModal data in req.body
        } = req.body;

        let url = "";
        let public_id = "";



        if (req.file) {

            try {
                // Upload file buffer to Cloudinary
                const uploadResult = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: "image",
                            folder: "users",
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(req.file.buffer); // Send file buffer to Cloudinary
                });

                url = uploadResult.secure_url;
                public_id = uploadResult.public_id;

            } catch (error) {
                console.error("Cloudinary Upload Error:", error);
                return res
                    .status(500)
                    .json({ status: "failed", message: error.message });
            }
        }

        // Basic validation
        if (!name || !email || !password) {
            return res.json({ status: "error", message: "Name, email, and password are required." });
        }
        if (password !== confirmPassword) {
            return res.json({ status: "error", message: "Passwords do not match." });
        }

        // Email uniqueness check
        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.json({ status: "error", message: "Email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare admin data
        const adminData = {
            name,
            email,
            password: hashedPassword,
            role,
            isActive,
            dob,
            gender: req?.body?.gender || "",
            pronouns: req?.body?.pronouns || "",
            company,
            phoneNumber,
            alternativeEmail,
            whatsapp,
            linkedin,
            facebook,
            instagram,
            username,
            team,
            profileImage: url,
            publicId: public_id,
            dataRetentionPeriod: req?.body?.dataRetentionPeriod || "",
            securityQuestion: req?.body?.securityQuestion || "",
            securityAnswer,
            twoFactorMethod,
            country,
            timeZone,
            preferredLanguage,
            currencyPreference,
            agreedToPolicies
        };

        // Save admin
        const admin = await adminModel.create(adminData);


        if (admin) {
            const setting = await settingModel.findOne({});
            const transporter = await getTransporter();

            const policyData = await policyModel.find({});

            // Generate PDF from all policy names and descriptions
            if (policyData && Array.isArray(policyData) && policyData.length > 0) {
                const doc = new PDFDocument();
                const writableStreamBuffer = new streamBuffers.WritableStreamBuffer();
                doc.pipe(writableStreamBuffer);
                doc.fontSize(18).text('RSIKDER Policies', { align: 'center' });
                doc.moveDown();
                policyData.forEach((policy, idx) => {
                    doc.fontSize(14).text(`${idx + 1}. ${policy.name}`, { underline: true });
                    doc.moveDown(0.5);
                    doc.fontSize(12).text(policy.description);
                    doc.moveDown(1);
                });
                doc.end();
                writableStreamBuffer.on('finish', async () => {
                    const pdfBuffer = writableStreamBuffer.getContents();
                    const mailOptions = {
                        from: `"RSIKDER" <${setting.email}>`,
                        to: `${email}`,
                        subject: "Welcome to RSIKDER",
                        text: `Hello ${name},\n\nWelcome to RSIKDER! Your account has been created successfully.\n\nYour account password is: ${password}\n\nIf you have any questions, feel free to reach out.\n\nBest regards,\nRSIKDER Team`,
                        attachments: [
                            {
                                filename: 'policy.pdf',
                                content: pdfBuffer,
                                contentType: 'application/pdf'
                            }
                        ]
                    };
                    (async () => {
                        try {
                            await transporter.sendMail(mailOptions);
                        } catch (err) {
                            console.error('Error sending email with PDF:', err);
                        }
                    })();
                });
            } else {
                // No policyData, send email without PDF
                const mailOptions = {
                    from: `"RSIKDER" <${setting.email}>`,
                    to: `${email}`,
                    subject: "Welcome to RSIKDER",
                    text: `Hello ${name},\n\nWelcome to RSIKDER! Your account has been created successfully.\n\nYour account password is: ${password}\n\nIf you have any questions, feel free to reach out.\n\nBest regards,\nRSIKDER Team`,
                    attachments: []
                };
                await transporter.sendMail(mailOptions);
            }
        }




        res.json({ status: "success", message: "Admin created successfully.", data: admin });
    } catch (error) {
        console.error("Error creating admin:", error.message);
        res.status(500).json({ status: "error", message: "Something went wrong.", error: error.message });
    }
};


async function getTransporter() {
    const setting = await settingModel.findOne({});

    if (!setting || !setting.email || !setting.appPassword) {
        throw new Error("Missing SMTP configuration in settings");
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: setting.email,
            pass: setting.appPassword,
        },
    });

    return transporter;
}



const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await adminModel.findByIdAndDelete(id);
        res.json({
            status: "success",
            message: "Admin deleted successfully.",
            data: result,
        });
    } catch (error) {
        console.error("Error deleting role:", error.message);
        res.json({
            status: "error",
            message: "Something went wrong while deleting the role.",
            error: error.message,
        });
    }
};




export { store, index, destroy };