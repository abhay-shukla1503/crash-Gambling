const Mongoose = require("mongoose");
Mongoose.pluralize(null);
const totalWithdrawModel = new Mongoose.Schema(
  {
    transactionId: {
      type: Mongoose.Types.ObjectId,
      ref: "transaction",
    },
    timestamp: {
      type: String,
    },
    totalWithdraw: {
      type: Number,
    },
    requestedAmount: {
      type: Number,
    },
    requestedAddress: {
      type: String,
    },
    withdrawDone: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpireTime: {
      type: Date,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    transactionStatus: {
      type: String,
      enum: ["CONFIRM", "PENDING", "CANCEL"],
      default: "PENDING",
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
  },
  { timestamps: true }
);

module.exports = Mongoose.model("totalWithdraw", totalWithdrawModel);
