const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const jwt = require("jsonwebtoken");
const key = "gambling";
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
      const msg = req.body.message;
      const decodedToken = await verifyToken(token);
  
      if (!token) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token is Required",
        });
      }
      if (decodedToken) {
        const user = await User.findOneAndUpdate(
          { _id: decodedToken.id },
          { otpVerified: false }
        );
        if (msg == "") {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Message is Required",
          });
        }
        const message_json = {
          the_user_id: user._id,
          the_username: user.username,
          message_body: msg,
          the_time: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
          the_date: new Date().toLocaleDateString(),
        };
        if (!message_json) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Message JSON not found.",
          });
        }
        const theLoop = await Game_loop.findOne();
        if (!theLoop) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "Game loop not found.",
          });
        }
        await Game_loop.findOneAndUpdate(
          { _id: theLoop._id },
          { $push: { chat_messages_list: message_json } }
        );
        messages_list.push(message_json);
  
        io.emit(
          "receive_message_for_chat_box",
          JSON.stringify(theLoop.chat_messages_list)
        );
  
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Successfully Message Delievered",
          responseResult: message_json,
        });
      }
    } catch (error) {
      console.log("Error in /send_message_to_chatbox:", error);
      return res.status(501).json({
        statusCode: 501,
        responseMessage: "Something went wrong.",
        responseResult: error,
      });
    }
  }