const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const TronWeb = require("tronweb");
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
      console.log("error in token:====>>>", error);
      res.send("Invalid token ");
    }
  }

module.exports = async(req,res) =>{
    try {
      const token = req.headers["token"];
      console.log("token", token);
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Token is required" });
      }
      const decodedToken = await verifyToken(token);
      if (decodedToken) {
        const user = await User.findOne({
          $or: [{ _id: decodedToken.id }, { email: decodedToken.email }],
        });
  
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found" });
        }
  
        const balance = await tronWeb.trx.getBalance(req.query.address);
        const data = {
          balance: Number(balance),
        };
        console.log("........data", data);
        if (balance != 0) {
          console.log("balance of trx", balance);
  
          // let Balance = balance / 1000000;
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Balance fetched successfully.",
            responseResult: data,
          });
        }
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