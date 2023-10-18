const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const transactionModel = require("/Users/admin/Desktop/crash Gambling/models/transaction");

async function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, key);
      return decoded;
    } catch (error) {
      console.log("errorin token:====>>>", error);
      res.send("Invalid token ");
    }
  }

module.exports = async(req,res,next) =>{
    try {
      const token = req.headers["token"];
      if (!token) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token required",
        });
      }
      const decodedToken = await verifyToken(token);
      if (decodedToken) {
        const user = await User.findOne({
          _id: decodedToken.id,
          status: "ACTIVE",
        });
        console.log(".........", user);
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found." });
        }
        const depositdata = await transactionModel.find({
          userId: user._id,
          transactionType: "DEPOSIT",
        });
        console.log("depositData===>>>>>>>>>", depositdata);
        if (!depositdata || depositdata.length == 0) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "Data not found." });
        }
        console.log("...................", depositdata);
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Deposit history Found",
          responseResult: depositdata,
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      console.log("Error message ::=>>>", error);
      return res.status(501).json({
        statusCode: 501,
        responseMessage: "Something went wrong.",
        responseResult: error,
      });
    }
  }