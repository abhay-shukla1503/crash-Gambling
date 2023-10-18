const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider; //This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider("https://nile.trongrid.io"); //Full node http endpoint
const solidityNode = new HttpProvider("https://nile.trongrid.io"); // Solidity node http endpoint
const eventServer = new HttpProvider("https://nile.trongrid.io"); //solidity node http endpoint
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
const transactionModel = require("/Users/admin/Desktop/crash Gambling/models/transaction");
const totalDepositModel = require("/Users/admin/Desktop/crash Gambling/models/totalDeposit");

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
      console.log("token", token);
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Token is required" });
      }
      const decodedToken = await verifyToken(token);
      if (decodedToken) {
        const user = await User.findOne({
          $or: [{ _id: decodedToken._id }, { email: decodedToken.email }],
        });
        console.log("user========", user);
        const totalAmount = await tronWeb.trx.getBalance(user.address);
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found" });
        }
        const adminAddress = process.env.TRON_ADMIN_ADDRESS;
        const address = await tronWeb.address.fromPrivateKey(user.privateKey);
        if (address != user.address) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Invalid userAddress.",
          });
        } else if (totalAmount > 0) {
          const tronWeb = new TronWeb(
            fullNode,
            solidityNode,
            eventServer,
            user.privateKey
          );
  
          const tradeobj = await tronWeb.transactionBuilder.sendTrx(
            adminAddress,
            100
          );
          const signedtxn = await tronWeb.trx.sign(tradeobj);
          const result = await tronWeb.trx.sendRawTransaction(signedtxn);
          console.log("result===>>", result);
          if (result.code == "CONTRACT_VALIDATE_ERROR") {
            return res.status(500).json({
              statusCode: 500,
              responseMessage: "Insufficient Energy.",
            });
          }
          const newTransaction = {
            transactionId: result.txid,
            timestamp: result.transaction.raw_data.timestamp,
            depositAmount: totalAmount,
            transactionStatus: "CONFIRM",
            userId: user._id,
            transactionType: "DEPOSIT",
          };
  
          const data = await transactionModel.create(newTransaction);
  
          console.log("Transaction record saved to MongoDB.", data);
          const obj = {
            userId: user._id,
            transactionId: data._id,
            totalDeposit: data.depositAmount,
          };
          const totalDeposit = await totalDepositModel.create(obj);
          const remainBal = user.balance - totalAmount;
  
          const update = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { balance: remainBal } }
          );
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Transfer transaction success.",
            responseResult: newTransaction,
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