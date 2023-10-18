const User = require("/Users/admin/Desktop/crash Gambling/models/user.js");
const jwt = require("jsonwebtoken");
const key = "gambling";
const nodemailer = require("nodemailer");

async function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, key);
      return decoded;
    } catch (error) {
      console.log("errorin token:====>>>", error);
      res.send("Invalid token ");
    }
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mobiloitte.node@gmail.com",
      pass: "wdbakhorlxmmqrhg",
    },
  });

  async function sendMail(user, otp) {
    const mailOptions = {
      from: "mobiloitte.node@gmail.com",
      to: user.email,
      subject: "OTP Verification",
      text: `Your OTP code is: ${otp}`,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Otp sent on email:" + info.response);
      console.log("info===============", info);
    } catch (error) {
      console.log(error);
      res.send("Failed to send OTP on email");
    }
  }

  function generateRandomOTP() {
    const characters = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters.charAt(randomIndex);
    }
    return otp;
  }

module.exports = async(req,res) =>{
    const token = req.headers["token"];
    const { email, password } = req.body;
    try {
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Token is required" });
      } else if (!email || typeof email !== "string") {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Email is required and must be a string",
        });
      } else if (!password || password == null) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Password is required and must be a string",
        });
      }
      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return res
          .status(404)
          .json({ statusCode: 404, responseMessage: "User not found" });
      }
      const isEmailExist = await User.findOne({
        email: email,
        _id: { $ne: user._id },
      });
      if (isEmailExist) {
        return res.status(403).json({
          statusCode: 403,
          responseMessage: "This email already exists",
        });
      } else {
        const updateEmail = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { email: email, otpVerified: false } },
          { new: true }
        );
        const otp = generateRandomOTP();
        const otpExpireTime = new Date().getTime() + 180000;
        user.otp = otp;
        user.otpExpireTime = otpExpireTime;
        await user.save();
        const sendCode = await sendMail(updateEmail, otp);
        console.log("sendcode=========", sendCode);
        return res.status(200).json({
          statusCode: 200,
          responseMessage:
            "Email updated successfully, OTP sent on your email,please verify OTP",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({ statusCode: 500, responseMessage: "Something went wrong" });
    }
}