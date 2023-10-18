const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");

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
        console.log("user", user);
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found." });
        } else {
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Wallet Address Found",
            responseresult: user.address,
          });
        }
      }
    } catch (error) {
      console.log("Error message ::=>>>", error);
      return res.status(501).json({
        statusCode: 501,
        responseMessage: "Something with wrong.",
        responseResult: error,
      });
    }
  }