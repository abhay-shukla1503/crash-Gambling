const Mongoose = require("mongoose")
Mongoose.pluralize(null);
const totalDepositModel = new Mongoose.Schema(
    {
        transactionId: {
            type: Mongoose.Types.ObjectId,
            ref: 'transaction'
        },
        timestamp: {
            type: String
        },
        totalDeposit: {
            type: Number
        },
        transactionStatus: {
            type: String,
            enum: ["CONFIRM", "PENDING", "CANCEL"],
            default: "PENDING",
        },
        userId: {
            type: Mongoose.Types.ObjectId,
            ref: 'users'
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE",
          },
    },
    { timestamps: true }
);

module.exports = Mongoose.model("totalDeposit", totalDepositModel)