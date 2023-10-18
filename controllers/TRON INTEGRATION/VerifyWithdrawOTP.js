const totalWithdrawModel = require("/Users/admin/Desktop/crash Gambling/models/totalWithdraw");
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const transactionModel = require("/Users/admin/Desktop/crash Gambling/models/transaction");

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
      const withdrawModel = await totalWithdrawModel.findOne({
        userId: user._id,
        otpVerified: false,
      });
  
      console.log(".........withdrawModel", withdrawModel);
      if (withdrawModel.otp !== otp) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Incorrect OTP",
        });
      }
      if (withdrawModel.otpVerified === true) {
        return res.status(409).json({
          statusCode: 409,
          responseMessage: "otp already verified",
        });
      } else {
        if (new Date().getTime() > withdrawModel.otpExpireTime) {
          return res.status(403).json({
            statusCode: 403,
            responseMessage: "otp expired",
          });
        }
        const result = await totalWithdrawModel
          .findOneAndUpdate(
            { _id: withdrawModel._id },
            { $set: { otpVerified: true } },
            { new: true }
          )
          .select("-otp");
        const txData = await transactionModel.findOne({
          userId: user._id,
        });
        const resUpdate = await transactionModel.findOneAndUpdate(
          { _id: transactionModel._id },
          { $set: { approveStatus: "APPROVE" } },
          { new: true }
        );
  
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "OTP verified successfully",
          responseResult: result,
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