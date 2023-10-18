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
      if (decodedToken) {
        const user = await User.findOne({
          _id: decodedToken.id,
          status: "ACTIVE",
        });
        console.log("user", user);
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found." });
        }
        if (!game_phase) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "Game Phase not found." });
        }
        // theLoop = await Game_loop.findById(GAME_LOOP_ID);
        theLoop = await Game_loop.findOne();
        if (!theLoop) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "Game Loop not found." });
        }
        let time_elapsed = (Date.now() - phase_start_time) / 1000.0;
        if (time_elapsed < 0) {
          return res.status(400).json({
            statusCode: 400,
            responseMessage: "Time Elapsed not found.",
          });
        }
  
        let betData = await betHistoryModel.findOne({ userID: user._id });
        if (!betData) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "Bet not found." });
        }
  
        const current_multiplier = (
          1.0024 * Math.pow(1.0718, time_elapsed)
        ).toFixed(2);
  
        if (
          user.payout_multiplier <= game_crash_value &&
          theLoop.active_player_id_list.includes(user._id)
        ) {
          const currUser = await User.findById(user._id);
  
          currUser.balance += currUser.bet_amount * currUser.payout_multiplier;
          // update the balance after the auto cashout
          await currUser.save();
          await theLoop.updateOne({
            $pull: { active_player_id_list: user._id },
          });
          for (const bettorObject of live_bettors_table) {
            console.log(".................", bettorObject);
            if (bettorObject.the_user_id === req.user.id) {
              await User.findByIdAndUpdate(
                { _id: user._id },
                { 
                  balance:
                    parseFloat(user.balance) +
                    parseFloat(
                      currUser.bet_amount * current_multiplier -
                        currUser.bet_amount
                    ),
                }
              );
              bettorObject.cashout_multiplier = currUser.payout_multiplier;
              bettorObject.profit =
                currUser.bet_amount * current_multiplier - currUser.bet_amount;
              bettorObject.b_bet_live = false;
              io.emit(
                "receive_live_betting_table",
                JSON.stringify(live_bettors_table)
              );
              break;
            }
          }
          await betHistoryModel.findByIdAndUpdate(
            { _id: betData._id },
            { multiplier: currUser.payout_multiplier }
          );
          return res.status(200).json({
            statusCode: 200,
            responseMessage:
              "Auto Cashout Done Successfully With Generated Profit.",
            responseResult: currUser.balance,
          });
        } else {
          return res.status(400).json({
            statusCode: 400,
            responseMessage:
              "Game Crash Value is Smaller the user payout multiplier.",
          });
        }
      }
    } catch (error) {
      console.error("Error in Auto Cashout Early:", error);
      return res.status(501).json({
        statusCode: 501,
        responseMessage: "Something went wrong.",
        responseResult: error,
      });
    }
  }