const Game_loop = require("/Users/admin/Desktop/crash Gambling/models/game_loop");

module.exports = async(req,res) =>{
    try {
      // const game_loop = await Game_loop.findById(GAME_LOOP_ID);
      const game_loop = await Game_loop.findOne();
      if (!game_loop) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Game loop not found", 
        });
      }
  
      crashMultipler = game_loop.multiplier_crash;
      const delta = sw.read(2);
      let seconds = delta / 1000.0;
      seconds = seconds.toFixed(2);
  
      return res.status(200).json({
        statusCode: 200,
        responseMessage: "Total profit generated successfully",
        responseResult: {
          "Crash Multiplier": crashMultipler,
          "Time Duration": seconds,
        },
      });
    } catch (error) {
      console.error("Error in /ShowProfitTillNow:", error);
      return res.status(501).json({
        statusCode: 501,
        responseMessage: "Something with wrong.",
        responseResult: error,
      });
    }
  }