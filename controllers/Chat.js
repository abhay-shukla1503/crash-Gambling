const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const express = require("express");
const apiRoutes = express.Router();

module.exports = async function(app){
apiRoutes.get("/getChat", async (req, res) => {
  try {
    // const theLoop = await Game_loop.findById(GAME_LOOP_ID);
    const theLoop = await Game_loop.findOne();
    if (!theLoop) {
      return res.status(404).json({
        statusCode: 404,
        responseMessage: "Game loop not found",
      });
    }
    return res.status(200).json({
      statusCode: 200,
      responseMessage: "Successfully Get Chat History",
      responseResult: theLoop.chat_messages_list,
    });
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return res.status(501).json({
      statusCode: 501,
      responseMessage: "Something with wrong.",
      responseResult: error,
    });
  }
});




app.use('/',apiRoutes)
}

