const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const Game_loop = require("/Users/admin/Desktop/crash Gambling/models/game_loop");

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
      // let theLoop = await Game_loop.findById(GAME_LOOP_ID);
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
        let theLoop = await Game_loop.findOne();
        if (!theLoop) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Game loop not found",
          });
        }
        const playerIdList = theLoop.active_player_id_list;
        crash_number = theLoop.multiplier_crash;
        for (const playerId of playerIdList) {
          const currUser = await User.findById(playerId);
          if (!currUser) {
            return res.status(404).json({
              statusCode: 404,
              responseMessage: "User not found",
            });
          }
          if (currUser.payout_multiplier <= crash_number) {
            currUser.balance += currUser.bet_amount * currUser.payout_multiplier;
            await currUser.save();
          }
        }
        theLoop.active_player_id_list = [];
        await theLoop.save();
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Winnings calculated successfully",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        statusCode: 501,
        responseMessage: "Internal server error",
        responseResult: error,
      });
    }
  }