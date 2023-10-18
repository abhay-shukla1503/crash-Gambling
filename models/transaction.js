const Mongoose = require("mongoose");
Mongoose.pluralize(null);
const transactionModel = new Mongoose.Schema(
  {
    transactionId: {
      type: String,
    },
    timestamp: {
      type: String,
    },
    depositAmount: {
      type: Number,
    },
    WithdrawAmount: {
      type: Number,
    },
    Tips: {
      type: Number,
    },
    transactionStatus: {
      type: String,
      enum: ["CONFIRM", "PENDING", "CANCEL"],
      default: "PENDING",
    },
    transactionType: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAW"],
    },
    userId: {
      type: Mongoose.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCK", "DELETE"],
      default: "ACTIVE",
    },
    approveStatus: {
      type: String,
      enum: ["APPROVE", "PENDING", "CANCEL"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = Mongoose.model("transaction", transactionModel);
