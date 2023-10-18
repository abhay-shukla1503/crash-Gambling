const User = require("/Users/admin/Desktop/crash Gambling/models/user.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const key = "gambling";

async function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, key);
      return decoded;
    } catch (error) {
      console.log("errorin token:====>>>", error);
      res.send("Invalid token ");
    }
  }

module.exports = async(req,res) =>{
    const token = req.headers["token"];
    const providedPassword = req.body.password;
  
    try {
      if (!token) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token is required",
        });
      } else if (!providedPassword) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Please provide password.",
        });
      }
  
      const decodedToken = await verifyToken(token);
  
      if (decodedToken) {
        const user = await User.findById(decodedToken.id);
  
        if (!user) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "User not found",
          });
        }
  
        const isPasswordValid = await bcrypt.compare(
          providedPassword,
          user.password
        );
  
        if (isPasswordValid) {
          const updatedRes = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { status: "DELETE" } },
            { new: true }
          );
  
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Account deleted successfully",
          });
        } else {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Incorrect Password",
          });
        }
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "Something went wrong",
      });
    }
}