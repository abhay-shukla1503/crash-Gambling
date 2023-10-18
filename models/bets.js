const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const bets = new mongoose.Schema({
  username: {
    type: String,
  },
  userID: {
    type: String,
  },
  time: {
    type: String,
  },
  betAmount: {
    type: String,
  },
  multiplier: {
    type: String,
  },
});

module.exports = mongoose.model("bets", bets);
