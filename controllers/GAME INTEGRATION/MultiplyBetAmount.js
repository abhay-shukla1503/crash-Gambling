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
      const token = req.headers["token"];
      if (!token) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "Token is required" });
      }
      const decodedToken = await verifyToken(token);
      console.log("first", decodedToken);
      if (decodedToken) {
        const thisUser = await User.findOne({ _id: decodedToken.id });
        if (!thisUser) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found" });
        }
        const game_loop = await Game_loop.findOne();
  
        if (!game_loop) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Game Loop not found",
          });
        }
        console.log(">>>>>>>>>>>>>>>", game_loop);
        crashMultipler = game_loop.multiplier_crash;
        thisUser.balance = thisUser.balance + crashMultipler;
        await thisUser.save();
        let obj = {
          lastBalance: thisUser.balance - crashMultipler,
          Earning: crashMultipler,
          updatedBalance: thisUser.balance,
        };
        console.log("this user", thisUser);
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Balance updated Successfully",
          responseResult: obj,
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      console.error("Error in /multiplyBetAmount:", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "Something went wrong",
        error: error,
      });
    }
  }