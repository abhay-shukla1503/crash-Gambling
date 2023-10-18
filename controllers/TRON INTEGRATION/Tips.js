const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider; //This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider("https://nile.trongrid.io"); //Full node http endpoint
const solidityNode = new HttpProvider("https://nile.trongrid.io"); // Solidity node http endpoint
const eventServer = new HttpProvider("https://nile.trongrid.io"); //solidity node http endpoint
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
const bcrypt = require("bcryptjs");
const transactionModel = require("/Users/admin/Desktop/crash Gambling/models/transaction");
const totalTipsModel = require("/Users/admin/Desktop/crash Gambling/models/totalTips");

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
      const { username, _id, amount, password } = req.body;
  
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Token is required" });
      }
      if (!username || !_id || !amount || !password) {
        return res
          .status(404)
          .json({ statusCode: 404, responseMessage: "All fields are Required" });
      }
      const decodedToken = await verifyToken(token);
      console.log("decodedToken", decodedToken);
      if (decodedToken) {
        const user = await User.findOne({
          $or: [
            { _id: decodedToken._id },
            { email: decodedToken.email },
            { username: decodedToken.username },
          ],
        });
        console.log("user========", user);
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found" });
        }
        let resultserRes = await User.findOne({
          _id: _id,
          status: "ACTIVE",
        });
        console.log("..................", resultserRes);
        if (!resultserRes) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "No User Found, With this ID",
          });
        }
        if (username != resultserRes.username && username != resultserRes.email) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Invalid UserName or Email",
          });
        }
  
        if (user.address == resultserRes.address) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Sender Address and Receiver Address cannot be same",
          });
        }
        const balance = await tronWeb.trx.getBalance(user.address);
        console.log("..........", balance);
        const amt = amount * 1000000;
        if (amt > balance) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Insufficient Balance",
          });
        }
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
          return res.status(404).send({
            statusCode: 404,
            responseMessage: "Wrong password",
          });
        }
        const senderAddress = user.address;
        const add = await tronWeb.address.fromPrivateKey(user.privateKey);
        if (add != senderAddress) {
          return res.status(400).json({
            statusCode: 400,
            responseMessage: "Invalid senderAddress.",
          });
        } else {
          const tronWeb = new TronWeb(
            fullNode,
            solidityNode,
            eventServer,
            user.privateKey
          );
          let totalAmount = amt;
          const tradeobj = await tronWeb.transactionBuilder.sendTrx(
            resultserRes.address,
            totalAmount
          );
          const signedtxn = await tronWeb.trx.sign(tradeobj);
          console.log("signedtxn===>>", signedtxn);
          const result = await tronWeb.trx.sendRawTransaction(signedtxn);
          tronWeb.trx.getBalance(resultserRes.address);
          const newTransaction = {
            transactionId: result.txid,
            timestamp: result.transaction.raw_data.timestamp,
            Tips: amt,
            transactionStatus: "CONFIRM",
            userId: user._id,
          };
          const data = await transactionModel.create(newTransaction);
          console.log("Transaction record saved to MongoDB.");
          const obj = {
            userId: user._id,
            transactionId: data._id,
            totalIncomingTips: data.amt,
          };
          const totalTips = await totalTipsModel.create(obj);
          console.log("totalTips===>>", totalTips);
          const senderBal = await tronWeb.trx.getBalance(user.address);
          const receiverBal = await tronWeb.trx.getBalance(resultserRes.address);
          const leftSenderBal = senderBal - totalAmount;
          let updateData = await User.findByIdAndUpdate(
            { _id: user._id },
            { balance: Number(leftSenderBal) }
          );
          const recBal = receiverBal + totalAmount;
          await User.findByIdAndUpdate({
            _id: resultserRes._id,
            balance: Number(recBal),
          });
          user.balance = senderBal;
          resultserRes.balance = receiverBal;
          user.save();
          resultserRes.save();
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Tips transaction success.",
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