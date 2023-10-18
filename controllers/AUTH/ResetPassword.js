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
    const { password } = req.body;
    try {
      if (!token) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token required.",
        });
      } else if (!password || password === "" || password === null) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Please provide required.",
        });
      } else {
        const decodedToken = await verifyToken(token);
        if (decodedToken) {
          const user = await User.findById(decodedToken.id);
          if (!user) {
            return res
              .status(404)
              .json({ statusCode: 404, responseMessage: "User not found" });
          }
          const pass = bcrypt.hashSync(password, 10);
          const resultData = User.findOneAndUpdate(
            { _id: token },
            { $set: { password: pass } },
            { new: true }
          );
          req.token = user._id;
          req.userDetails = resultData;
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Your password is changed successfully.",
          });
        } else {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Incorrect token",
          });
        }
      }
    } catch (error) {
      console.log("5444444444444444", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "An error occurred while processing your request",
        error: error,
      });
    }
}