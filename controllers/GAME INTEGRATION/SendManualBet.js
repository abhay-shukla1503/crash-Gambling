const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const Game_loop = require("/Users/admin/Desktop/crash Gambling/models/game_loop");
const betHistoryModel = require("/Users/admin/Desktop/crash Gambling/models/bets");

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
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token is required",
        });
      }
      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
        return res.status(401).json({
          statusCode: 401,
          responseMessage: "Invalid token",
        });
      }
  
      const user = await User.findOne({
        _id: decodedToken.id,
        status: "ACTIVE",
      });
  
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "User not found",
        });
      }
  
      if (isNaN(req.body.bet_amount) || isNaN(req.body.payout_multiplier)) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Bet amount and payout multiplier must be numbers",
        });
      }
  
      const theLoop = await Game_loop.findOne();
  
      if (!theLoop) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Game Loop not found",
        });
      }
  
      const playerIdList = theLoop.active_player_id_list;
  
      if (playerIdList.includes(user._id)) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "You are already betting this round",
        });
      }
  
      if (req.body.bet_amount > user.balance) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Bet amount is too big",
        });
      }
  
      let body = {
        active_player_id_list: {},
      };
      body.active_player_id_list = user._id;
      if (body.active_player_id_list === "") {
        await User.findByIdAndUpdate(user._id, {
          bet_amount: req.body.bet_amount,
          payout_multiplier: req.body.payout_multiplier,
          balance: user.balance - req.body.bet_amount,
          wagered: user.wagered + req.body.bet_amount,
        });
      } else {
        await User.findByIdAndUpdate(user._id, {
          bet_amount: req.body.bet_amount,
          payout_multiplier: req.body.payout_multiplier,
          balance: user.balance - req.body.bet_amount,
          wagered: user.wagered + req.body.bet_amount,
        });
      }
      console.log(",,,,,,,,", user);
  
      // Add the user to the active player list
      await Game_loop.findByIdAndUpdate({ _id: theLoop._id }, body);
  
      // Create info_json and add it to the live_bettors_table
      const info_json = {
        the_user_id: user._id,
        the_username: user.username,
        bet_amount: req.body.bet_amount,
        cashout_multiplier: req.body.payout_multiplier, //this is is initialised null at the first time, now we have changed this to the request cashout point
        profit: null,
        b_bet_live: true,
      };
      live_bettors_table.push(info_json);
      console.log("....................", live_bettors_table);
      await gameHistoryModel.create({
        userId: user._id,
        betAmount: req.body.bet_amount,
        payoutMultiplier: req.body.payout_multiplier,
      });
  
      const timeofSendBet = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
  
      await betHistoryModel.create({
        userID: user._id,
        username: user.username,
        betAmount: req.body.bet_amount,
        time: timeofSendBet,
      });
  
      io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table));
  
      return res.status(200).json({
        success: true,
        result: {
          responseMessage: `Bet placed for ${user.username}`,
          responseResult: live_bettors_table,
        },
      });
    } catch (error) {
      console.error("Error in /sendManualBet:", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "Something went wrong",
        responseResult: error,
      });
    }
  }