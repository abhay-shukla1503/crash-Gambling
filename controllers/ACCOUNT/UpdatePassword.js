const User = require("/Users/admin/Desktop/crash Gambling/models/user.js");
const jwt = require("jsonwebtoken");
const key = "gambling";
const bcrypt = require("bcryptjs");

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
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    try {
      if (!token) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token required",
        });
      } else if (!oldPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Please provide required fields.",
        });
      } else {
        if (oldPassword === confirmNewPassword || oldPassword === newPassword) {
          return res.status(403).json({
            statusCode: 403,
            responseMessage: "New password must be different from old one .",
          });
        }
        if (newPassword === confirmNewPassword) {
          const decodedToken = await verifyToken(token);
          if (decodedToken) {
            const user = await User.findById({ _id: decodedToken.id });
            if (!user) {
              return res
                .status(404)
                .json({ success: false, message: "User not found." });
            } else {
              const pass = bcrypt.compareSync(oldPassword, user.password);
              if (pass) {
                const hashedPassword = bcrypt.hashSync(newPassword, 10);
                await User.findOneAndUpdate(
                  { _id: user._id },
                  { $set: { password: hashedPassword } },
                  { new: true }
                );
                return res.status(200).json({
                  statusCode: 200,
                  responseMessage: "Password updated successfully.",
                });
              } else {
                return res.status(404).json({
                  statusCode: 404,
                  responseMessage: "Incorrect password.",
                });
              }
            }
          } else {
            return res.status(404).json({
              statusCode: 404,
              responseMessage: "Incorrect token",
            });
          }
        } else {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Password and confirm Password must be same.",
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