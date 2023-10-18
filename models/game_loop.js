const mongoose = require("mongoose");
const game_loop = new mongoose.Schema({
  round_number: {
    type: Number,
    default: 1,
  },
  active_player_id_list: {
    type: [String],
    default: [],
  },
  multiplier_crash: {
    type: Number,
    default: 0,
  },
  b_betting_phase: {
    type: Boolean,
    default: false,
  },
  b_game_phase: {
    type: Boolean,
    default: false,
  },
  b_cashout_phase: {
    type: Boolean,
    default: false,
  },
  time_now: {
    type: Number,
    default: -1,
  },
  previous_crashes: {
    type: [Number],
    default: [],
  },
  round_id_list: {
    type: [Number],
    default: [],
  },
  chat_messages_list: {
    type: [],
    default: [],
  },
});

module.exports = mongoose.model("game_loop", game_loop);

(async () => {
  const checkRes = await mongoose.model("game_loop", game_loop).find({});
  if (checkRes.length == 0) {
    await mongoose.model("game_loop", game_loop).create({
      round_number: 1,
      multiplier_crash: 0,
      b_betting_phase: true,
      b_game_phase: true,
      b_cashout_phase: true,
      time_now: -1,
      previous_crashes: [1, 34, 67, 8],
      round_id_list: [3, 7, 9],
      chat_messages_list: [],
    });
    console.log("created");
  } else {
    console.log("already created");
  }
}).call();
