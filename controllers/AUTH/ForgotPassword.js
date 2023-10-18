const User = require("../../models/user");
const key = "gambling";
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

async function generateToken(payload) {
    return jwt.sign(payload, key, { expiresIn: "24h" });
  } 

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mobiloitte.node@gmail.com",
      pass: "wdbakhorlxmmqrhg",
    },
  });

  async function sendLink(user, url) {
    const mailOptions = {
      from: "mobiloitte.node@gmail.com",
      to: user.email,
      subject: "Verification Link",
      text: `Your verification link is: ${url}`,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Varification link sent on email:" + info.response);
      console.log("info===============", info);
    } catch (error) {
      console.log(error);
      res.send("Failed to send Varification link  on email");
    }
  }

module.exports = async(req,res) =>{
    const { email, redirectUrl } = req.body;
    try {
      if (!email || !redirectUrl) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Email and redirectUrl required",
        });
      }
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "User not found.",
        });
      }
      const payload = {
        id: user._id,
        email: user.email,
        userType: user.userType,
      };
      const token = await generateToken(payload);
      const commonUrl = `${redirectUrl}?${token}`;
      await sendLink(user, commonUrl);
      return res.status(200).json({
        statusCode: 200,
        responseMessage: "Password reset link on your email",
        responseResult: token,
      });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "An error occurred while processing your request",
        error: error,
      });
    }
}