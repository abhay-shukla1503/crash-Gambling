const Mongoose = require("mongoose");
Mongoose.pluralize(null);
const gameHistorySchema = new Mongoose.Schema(
  {
    userId: {
      type: Mongoose.Types.ObjectId,
      ref: "users",
    },
    gameId: {
      type: Mongoose.Types.ObjectId,
      ref: "game_loop",
    },
    betAmount: { type: Number },
    winAmont: { type: Number },
    payoutMultiplier: { type: Number },
    isWin: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCK", "DELETE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true, collection: "gameHistory" }
);

module.exports = Mongoose.model("gameHistory", gameHistorySchema);
