const { CronJob } = require("cron");
const User = require("../models/user");
const totalDepositModel = require("../models/totalDeposit");
const transactionModel = require("../models/transaction");
const TronWeb = require("tronweb");
const fullNode = "https://api.trongrid.io";
const solidityNode = "https://api.trongrid.io";
const eventServer = "https://api.trongrid.io";

// Cron job
const depositFromOwner = new CronJob("*/5 * * * * *", async () => {
  try {
    await userData();
    await processDeposit(user);
    console.log("Deposit processed successfully.");
  } catch (error) {
    console.error("Error processing deposit:", error);
  }
});

depositFromOwner.start();
module.exports = { depositFromOwner };

async function userData() {
  const token = req.headers["token"];
  if (!token) {
    return res
      .status(400)
      .json({ statusCode: 400, responseMessage: "Token is required" });
  }
  const decodedToken = await verifyToken(token);
  if (!decodedToken) {
    return res
      .status(401)
      .json({ statusCode: 401, responseMessage: "Invalid token" });
  }
  const user = await User.findOne({
    $or: [{ _id: decodedToken._id }, { email: decodedToken.email }],
  });
  if (!User) {
    return res
      .status(404)
      .json({ statusCode: 404, responseMessage: "User not found" });
  }
  return user;
}

async function processDeposit(user) {
  await userData();
  const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    user.privateKey
  );
  const totalAmount = await tronWeb.trx.getBalance(user.address);
  if (totalAmount > 0) {
    const adminAddress = process.env.TRON_ADMIN_ADDRESS;
    const tradeobj = await tronWeb.transactionBuilder.sendTrx(adminAddress, 1);
    const signedtxn = await tronWeb.trx.sign(tradeobj);
    const result = await tronWeb.trx.sendRawTransaction(signedtxn);
    console.log("result===>>", result);
    if (result.code === "CONTRACT_VALIDATE_ERROR") {
      return { responseMessage: "Insufficient Energy." };
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
    console.log("totalDeposit===>>", totalDeposit);
    const remainBal = user.balance - 1;
    console.log("remainBal===>>", remainBal);
    const update = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { balance: remainBal } },
      { new: true }
    );
    return res.status(200).json({
      statusCode: 200,
      responseMessage: "Transfer transaction success.",
      responseResult: newTransaction,
    });
  }
}
