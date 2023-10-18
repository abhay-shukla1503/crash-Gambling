const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const User = require("../../models/user");
const nodemailer = require("nodemailer");
const key = "gambling";

async function generateToken(payload) {
    return jwt.sign(payload, key, { expiresIn: "24h" });
  } 

  function generateRandomOTP() {
    const characters = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters.charAt(randomIndex);
    }
    return otp;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mobiloitte.node@gmail.com",
      pass: "wdbakhorlxmmqrhg",
    },
  });

  async function sendMail(user, otp) {
    const mailOptions = {
      from: "mobiloitte.node@gmail.com",
      to: user.email,
      subject: "OTP Verification",
      text: `Your OTP code is: ${otp}`,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Otp sent on email:" + info.response);
      console.log("info===============", info);
    } catch (error) {
      console.log(error);
      res.send("Failed to send OTP on email");
    }
  }


module.exports = async(req,res) =>{
        const { username, password, twoFaCode } = req.body;
        try {
          if (!username) {
            return res.status(404).json({
              statusCode: 404,
              responseMessage: "Please provide username or email.",
            });
          } else if (!password) {
            return res.status(404).json({
              statusCode: 404,
              responseMessage: "Please provide password.",
            });
          }
          const user = await User.findOne({
            $or: [{ username: username }, { email: username }],
          });
          if (!user) {
            return res.status(404).json({
              statusCode: 404,
              responseMessage: "User not found.",
            });
          }
          if (user.status === "DELETE") {
            return res.status(404).json({
              statusCode: 404,
              responseMessage: "Your account is deleted by admin ",
            });
          }
          const isMatch = bcrypt.compareSync(password, user.password);
          if (!isMatch) {
            return res.status(404).send({
              statusCode: 404,
              responseMessage: "Wrong password",
            });
          }
          if (user.twofactorauthentication == true && user.otpVerified == true) {
            if (twoFaCode) {
              var verified = speakeasy.totp.verify({
                secret: user.secret,
                encoding: "base32",
                token: twoFaCode,
              });
      
              console.log("verified=======", verified);
              if (verified) {
                const payload = {
                  id: user.id,
                  email: user.email,
                  password: user.password,
                  userType:user.userType
                };
                const token = await generateToken(payload);
                const reponse = {
                  otpVerified: user.otpVerified,
                  token: token,
                  userType: user.userType,
                };
                // await User.findByIdAndUpdate({ _id: user._id }, { $set: { twofactorauthentication: true } });
                return res.status(200).json({
                  statusCode: 200,
                  responseMessage: "Login successfully",
                  responseResult: reponse,
                });
              } else {
                return res
                  .status(400)
                  .json({ statusCode: 400, responseMessage: "Invalid Secret Code" });
              }
            } else {
              const payload = {
                id: user.id,
                email: user.email,
                password: user.password,
                userType: user.userType,
              };
              const token = await generateToken(payload);
              const reponse = {
                otpVerified: user.otpVerified,
                twofactorauthentication: user.twofactorauthentication,
                token: token,
                userType: user.userType,
              };
              return res.status(200).send({
                statusCode: 200,
                responseMessage: "Login successfully ",
                responseResult: reponse,
              });
            }
          } else {
            if (user.otpVerified == true) {
              const payload = {
                id: user.id,
                email: user.email,
                password: user.password,
                userType: user.userType,
              };
              const token = await generateToken(payload);
              const reponse = {
                otpVerified: user.otpVerified,
                token: token,
                userType: user.userType,
              };
              return res.status(200).send({
                statusCode: 200,
                responseMessage: "Login successfully ",
                responseResult: reponse,
              });
            }
            const otp = generateRandomOTP();
            const otpExpireTime = new Date().getTime() + 180000;
            const otpVerify = false;
            await User.updateOne(
              { _id: user._id },
              {
                $set: {
                  otp: otp,
                  otpExpireTime: otpExpireTime,
                  otpVerified: otpVerify,
                },
              }
            );
            const sendCode = await sendMail(user, otp);
            const response = {
              otp: otp,
              otpVerified: false,
            };
            req.login(user, (err) => {
              if (err) throw err;
              res.status(200).send({
                statusCode: 200,
                responseMessage: "OTP sent please verify OTP",
                // responseResult: response,
              });
            });
          }
        } catch (error) {
          console.log("error=============", error);
          res.status(501).json({
            statusCode: 501,
            responseMessage: "Something went wrong",
            error: error,
          });
        }
      
}