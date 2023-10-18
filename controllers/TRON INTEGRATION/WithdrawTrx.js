const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user.js");
const totalWithdrawModel = require("/Users/admin/Desktop/crash Gambling/models/totalWithdraw");
const TronWeb = require("tronweb");
const userType = require("/Users/admin/Desktop/crash Gambling/userType.js");
const HttpProvider = TronWeb.providers.HttpProvider; //This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider("https://nile.trongrid.io"); //Full node http endpoint
const solidityNode = new HttpProvider("https://nile.trongrid.io"); // Solidity node http endpoint
const eventServer = new HttpProvider("https://nile.trongrid.io"); //solidity node http endpoint
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
const transactionModel = require("/Users/admin/Desktop/crash Gambling/models/transaction");

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
        console.log("=====================================", decodedToken);
        const user = await User.findOne({
          _id: decodedToken.id,
          userType: userType.ADMIN,
        });
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "UnAuthorized Person" });
        }
        const withdrawData = await totalWithdrawModel.findOne({
          _id: req.body.withdrawRequestId,
          withdrawDone: false,
        });
        const userData = await User.findOne({
          _id: withdrawData.userId,
        });
        if (!userData) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "User not found",
          });
        }
  
        if (withdrawData.requestedAmount > userData.balance) {
          return res.status(400).json({
            statusCode: 400,
            responseMessage: "Insufficient Balance.",
            responseResult: [],
          });
        }
        const address = await tronWeb.address.fromPrivateKey(
          process.env.TRON_PRIVATE_KEY
        );
        if (address != process.env.TRON_ADMIN_ADDRESS) {
          return res.status(400).json({
            statusCode: 400,
            responseMessage: "Invalid Admin Address Found.",
            responseResult: [],
          });
        }
        if (withdrawData.withdrawDone == true) {
          return res.status(400).json({
            statusCode: 400,
            responseMessage: "No Request For withdraw funds.",
            responseResult: [],
          });
        } else {
          const tronWeb = new TronWeb(
            fullNode,
            solidityNode,
            eventServer,
            process.env.TRON_PRIVATE_KEY
          );
          const tradeobj = await tronWeb.transactionBuilder.sendTrx(
            withdrawData.requestedAddress,
            withdrawData.requestedAmount
          );
          const signedtxn = await tronWeb.trx.sign(tradeobj);
  
          const result = await tronWeb.trx.sendRawTransaction(signedtxn);
          const newTransaction = {
            transactionId: result.txid,
            timestamp: result.transaction.raw_data.timestamp,
            WithdrawAmount: withdrawData.requestedAmount,
            transactionStatus: "CONFIRM",
            userId: withdrawData.userId,
            transactionType: "WITHDRAW",
          };
          const data = await transactionModel.create(newTransaction);
  
          let updateWithdrawData = await totalWithdrawModel.findOneAndUpdate({
            withdrawDone: true,
            transactionStatus: "CONFIRM",
          });
          let updateUser = await User.findOneAndUpdate(
            { _id: userData._id },
            {
              balance:
                parseFloat(userData.balance) -
                parseFloat(withdrawData.requestedAmount),
            }
          );
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Withdraw transaction success.",
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