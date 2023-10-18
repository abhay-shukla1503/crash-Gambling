const jwt = require("jsonwebtoken");
const key = "gambling";
const bcrypt = require("bcryptjs");
const User = require("/Users/admin/Desktop/crash Gambling/models/user.js");
const speakeasy = require("speakeasy");

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
    const { secret, code, password } = req.body;
    try {
      if (!password) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Password required" });
      }
      if (!secret || !code) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Secret Key and Secret Code required",
        });
      }
      console.log("Received Secret:", secret);
      console.log("Received Code:", code);
      if (!token) {
        return res
          .status(404)
          .json({ statusCode: 404, responseMessage: "Token is required" });
      }
      const decodedToken = await verifyToken(token);
      if (decodedToken) {
        const user = await User.findOne({ _id: decodedToken.id });
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found" });
        }
        const pass = bcrypt.compareSync(password, user.password);
        console.log("pass===", pass);
        if (!pass) {
          return res
            .status(401)
            .json({ statusCode: 401, responseMessage: "Invalid password" });
        } else {
          if (user.twofactorauthentication === true) {
            const update = await User.findOneAndUpdate(
              { _id: user._id },
              { $set: { twofactorauthentication: false } }
            );
            return res.status(400).json({
              statusCode: 400,
              responseMessage: "Two factor authentication disable successsfully.",
            });
          }
          var verified = speakeasy.totp.verify({
            secret: secret,
            encoding: "base32",
            token: code,
          });
          console.log("verified=======", verified);
          if (verified) {
            await User.findByIdAndUpdate(
              { _id: user._id },
              { $set: { twofactorauthentication: true } }
            );
            return res.status(200).json({
              statusCode: 200,
              responseMessage: "Two-factor authentication enabled successfully",
            });
          } else {
            return res
              .status(400)
              .json({ statusCode: 400, responseMessage: "Invalid Secret Code" });
          }
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
        responseResult: error,
      });
    }
}