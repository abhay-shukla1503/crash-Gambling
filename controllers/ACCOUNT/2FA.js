const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const key = "gambling";
const QRCode = require("qrcode");

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
    try {
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Token is required" });
      }
      const decodedToken = await verifyToken(token);
      if (decodedToken) {
        const user = await User.findById(decodedToken.id);
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found" });
        }
        if (user.twofactorauthentication === true) {
          const update = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { twofactorauthentication: false, secret: null, url: null } }
          );
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Two factor authentication disable successsfully.",
            responseMessage: update,
          });
        } else {
          var secret = speakeasy.generateSecret();
          if (!secret) {
            return res.status(500).json({
              statusCode: 500,
              responseMessage: "Internal server error",
            });
          }
          const otpauthUrl = secret.otpauth_url;
          const base32Secret = secret.base32;
          QRCode.toDataURL(otpauthUrl, async (err, dataUrl) => {
            if (err) {
              console.error("Error generating QR code:", err);
              return res.status(500).json({
                statusCode: 500,
                responseMessage: "Error generating QR code",
                error: err,
              });
            }
            let obj = {
              url: dataUrl,
              secret: base32Secret,
            };
            // await User.findOneAndUpdate({_id:user._id},{obj})
            const data = await User.findByIdAndUpdate(
              { _id: user._id },
              { $set: { url: dataUrl, secret: base32Secret } }
            );
            return res.status(200).json({
              statusCode: 200,
              responseMessage: "Operation successful.",
              responseResult: obj,
            });
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
        error: error,
      });
    }
}