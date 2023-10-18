const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
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
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 400, responseMessage: "User not found." });
        }
  
        const adminAddress = process.env.TRON_ADMIN_ADDRESS;
  
        var otpauthUrl = adminAddress;
        console.log("otpauthUrl========", otpauthUrl);
        if (!otpauthUrl) {
          return res
            .status(500)
            .json({ statusCode: 500, responseMessage: "Internal server error" });
        }
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
            data: adminAddress,
          };
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Operation successful.",
            responseResult: obj,
          });
        });
        const data = {
          adminAddress: otpauthUrl,
          address: process.env.TRON_ADMIN_ADDRESS,
        };
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Admin address Found",
          responseresult: data,
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        statusCode: 501,
        responseMessage: "Something went wrong.",
        responseResult: error,
      });
    }
  }