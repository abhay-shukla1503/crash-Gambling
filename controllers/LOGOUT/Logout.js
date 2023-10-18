const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const jwt = require("jsonwebtoken");
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
    try {
      const token = req.headers["token"];
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Token is required" });
      }
      const decodedToken = await verifyToken(token);
      if (decodedToken) {
        const user = await User.findOneAndUpdate(
          { _id: decodedToken.id },
          { otpVerified: false }
        );
        console.log("user===>>", user);
        return res.status(200).json({
          statusCode: 200,
          responseMessages: "Successfully Logout",
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      console.error("Error in /logout:", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "Something went wrong",
        error: error,
      });
    }
  }