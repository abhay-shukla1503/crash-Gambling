const Mongoose = require("mongoose");
Mongoose.pluralize(null);
const totalTipsModel = new Mongoose.Schema(
  {
    transactionId: {
      type: Mongoose.Types.ObjectId,
      ref: "transaction",
    },
    timestamp: {
      type: String,
    },
    totalIncomingTips: {
      type: Number,
    },
    totalOutgoingTips: {
      type: Number,
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

module.exports = Mongoose.model("totalTips", totalTipsModel);
