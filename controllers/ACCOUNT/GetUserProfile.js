const User = require("/Users/admin/Desktop/crash Gambling/models/user.js");
const TronWeb = require("tronweb");
const jwt = require("jsonwebtoken");
const key = "gambling";
const HttpProvider = TronWeb.providers.HttpProvider; //This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider("https://nile.trongrid.io"); //Full node http endpoint
const solidityNode = new HttpProvider("https://nile.trongrid.io"); // Solidity node http endpoint
const eventServer = new HttpProvider("https://nile.trongrid.io"); //solidity node http endpoint
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);

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
    const token = req.headers["token"];
    try {
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
  
        const latestBalance = await tronWeb.trx.getBalance(user.address);
        console.log("..........latest", latestBalance);
  
        const latestData = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { balance: latestBalance } }
        );
        console.log("..latestData", latestData);
        const { privateKey, ...userWithoutPrivateKey } = latestData.toObject();
  
        // delete user.privateKey;
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "User Found",
          responseresult: userWithoutPrivateKey,
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      console.log("error==>>", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "An error occurred while processing your request",
        error: error,
      });
    }
}