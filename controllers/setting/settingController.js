import settingModel from "../../models/settingModel.js";
import nodemailer from "nodemailer";

// ------------------------------- Create Order -------------------------------
export const insertOrUpdateEmail = async (req, res) => {
  const { email, code, toEmail, appPassword, expairTime, sessionUnit } = req.body;

  try {
    const setting = await settingModel.findOneAndUpdate(
      {},
      { 
        email,
        toEmail: toEmail,
        appPassword: appPassword,
        expairTime: expairTime,
        sessionUnit: sessionUnit,
        
      },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSetting = async (req, res) => {
  try {
    const setting = await settingModel.findOne({});
    res.status(200).json({ success: true, setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  const setting = await settingModel.findOne({});

  if (setting.code === otp) {
    res.json({
       status: 'success', 
       message: "OTP verified successfully"
     });
  } else {
    res.status(400).json({ success: false, message: "Invalid OTP" });
  }

};


export const verifyPin = async (req, res) => {
  const { pinValue } = req.body;

  // console.log("PINNN", req.body);

  const setting = await settingModel.findOne({});

  if (setting.code === pinValue) {
    res.json({
       status: 'success', 
       message: "PIN verified successfully"
     });
  } else {
    res.status(400).json({ success: false, message: "Invalid PIN" });
  }
}


async function getTransporter() {
  const setting = await settingModel.findOne({});

  if (!setting || !setting.email || !setting.appPassword) {
    throw new Error('Missing SMTP configuration in settings');
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

function generateUniqueSixDigitNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}


export const forgotpin = async (req, res) => {
  try {
    const setting = await settingModel.findOne({});
    const transporter = await getTransporter();

    const uniqueNumber = generateUniqueSixDigitNumber();

    const info = await transporter.sendMail({
      from: `"RSIKDER" <${setting.email}>`,
      to: `${setting.toEmail}`,
      subject: "Forgot Password",
      text: `Your Password is ${uniqueNumber}`,
    });

    console.log("===================");
    console.log("info", info);

    if (info.accepted.length > 0) {
      await settingModel.findOneAndUpdate(
        {},
        { code: uniqueNumber },
        { upsert: true, new: true }
      );

      res.json({
        status: "success",
        message: "Email sent successfully"
      });
    } else {
      res.status(500).json({ status: "error", message: "Email not accepted" });
    }
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    res.status(500).send('Failed to send email.');
  }
};

// export const forgotpin = async (req, res) => {
//   try {
//     const setting = await settingModel.findOne({});
//     res.status(200).json({ success: true, setting });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// }
