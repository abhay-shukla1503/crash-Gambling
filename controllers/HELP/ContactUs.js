const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const contactusModel = require("/Users/admin/Desktop/crash Gambling/models/contactUs");

module.exports = async(req,res) =>{
    const { email, username, message } = req.body;
    try {
      if ((!email && !username) || !username || !email) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Please give all required field",
        });
      } else if (!message) {
        return res.status(400).send({
          statusCode: 400,
          responseMessage: "please enter your message",
        });
      }
      const user = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "User not found",
        });
      }
      const object = {
        username: username,
        email: email,
        message: message,
      };
      const result = await contactusModel.create(object);
      return res.status(200).json({
        statusCode: 200,
        responseMessage: "operation successfull",
      });
    } catch (error) {
      console.error("OTP Verification Error:", error);
      res.status(500).json({
        statusCode: 505,
        responseMessage: "Something went wrong",
        error: error,
      });
    }
  }