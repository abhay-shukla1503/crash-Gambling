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
      if (decodedToken) {
        const user = await User.findOne({ _id: decodedToken.id });
        console.log("........................", user);
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 404, responseMessage: "User not found" });
        }
  
        const randomInt = Math.floor(Math.random() * 6) + 1;
        // const game_loop = await Game_loop.findById(GAME_LOOP_ID);
        const game_loop = await Game_loop.findOne();
        if (!game_loop) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Game loop not found",
          });
        }
  
        game_loop.multiplier_crash = randomInt;
        await game_loop.save();
  
        let obj = { randomCrashAt: randomInt };
        // res.json(randomInt);
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Successfully generated cash Value",
          responseResult: obj,
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "Something went wrong",
        error: error.message,
      });
    }
  }