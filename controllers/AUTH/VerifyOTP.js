const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const key = "gambling";

async function generateToken(payload) {
    return jwt.sign(payload, key, { expiresIn: "24h" });
  } 

module.exports = async(req,res) =>{
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({
        $or: [{ username: email }, { email: email }],
      });
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "User not found",
        });
      }
      if (user.otp !== otp) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Incorrect OTP",
        });
      }
      if (user.otpVerified === true) {
        return res.status(409).json({
          statusCode: 409,
          responseMessage: "otp already verified",
        });
      } else {
        if (new Date().getTime() > user.otpExpireTime) {
          return res.status(403).json({
            statusCode: 403,
            responseMessage: "otp expired",
          });
        }
        const result = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { otpVerified: true } },
          { new: true }
        ).select("-otp");
        const payload = {
          id: user.id,
          email: user.email,
          password: user.password,
          userType: user.userType,
        };
        const token = await generateToken(payload);
  
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "OTP verified successfully",
          responseResult: token,
        });
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      res.status(500).json({
        statusCode: 505,
        responseMessage: "Something went wrong",
        error: error,
      });
    }
}