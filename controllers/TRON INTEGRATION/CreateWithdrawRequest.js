const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const bcrypt = require("bcryptjs");
const totalDepositModel = require("/Users/admin/Desktop/crash Gambling/models/totalDeposit.js");
const totalWithdrawModel = require("../../models/totalWithdraw.js");
const nodemailer = require("nodemailer");

function generateRandomOTP() {
    const characters = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters.charAt(randomIndex);
    }
    return otp;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mobiloitte.node@gmail.com",
      pass: "wdbakhorlxmmqrhg",
    },
  });

async function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, key);
      return decoded;
    } catch (error) {
      console.log("errorin token:====>>>", error);
      res.send("Invalid token ");
    }
  }

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

module.exports = async(req,res) =>{
    try {
      const token = req.headers["token"];
      const { password, recieverAddress, amount } = req.body;
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Token is required" });
      } else if (!password || !recieverAddress || !amount) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "All fields are required" });
      }
  
      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
        return res
          .status(401)
          .json({ statusCode: 401, responseMessage: "Invalid Token" });
      }
  
      const user = await User.findOne({
        $or: [{ _id: decodedToken.id }, { email: decodedToken.email }],
      });
  
      if (!user) {
        return res
          .status(404)
          .json({ statusCode: 404, responseMessage: "User not found" });
      }
  
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Wrong password" });
      }
      const depositData = await totalDepositModel.findOne({ userId: user._id });
      console.log("............depoitdata", depositData);
      const userBal = depositData.totalDeposit;
      if (!userBal || userBal < amount) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Insufficient Balance." });
      }
  
      const otp = generateRandomOTP();
      const otpExpireTime = new Date().getTime() + 180000;
      if (!user.email) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Invalid recipient email address",
        });
      }
  
      const sendCode = await sendMail(user, otp);
      const withdrawModel = await totalWithdrawModel.findOne({
        userId: user._id,
        otpVerified: false,
      });
      console.log(".........", withdrawModel);
      if (!withdrawModel) {
        const obj = {
          userId: user._id,
          requestedAddress: recieverAddress,
          requestedAmount: amount,
          otp: otp,
          otpExpireTime: otpExpireTime,
        };
        const withdrawApprovalData = await totalWithdrawModel.create(obj);
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Withdraw Request Created, Please verify OTP",
        });
      } else {
        const result = await totalWithdrawModel.findOneAndUpdate(
          { _id: withdrawModel._id },
          { $set: { otp: otp, otpExpireTime: otpExpireTime } },
          { new: true }
        );
        console.log(".........result", result.otpExpireTime);
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Withdraw Request Done,Resend OTP",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "Something went wrong.",
        responseResult: error,
      });
    }
}