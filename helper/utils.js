import config from "config";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

module.exports = {
  getOTP() {
    var otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  },

  getToken: async (payload) => {
    var token = jwt.sign(payload, config.get("jwtsecret"), {
      expiresIn: "24h",
    });
    return token;
  },

  sendMail: async (to, name, link) => {
    let html = `<div style="font-size:15px">
                <p>Hello ${name},</p>
                <p>Please click on the following link <a href="${config.get(
                  "hostAddress"
                )}${link}">
                  Set a new password now
                </a>
                    If you did not request this, please ignore this email and your password will remain unchanged.
                </p> 
                <p>
                    Thanks<br>
                </p>
            </div>`;

    var transporter = nodemailer.createTransport({
      service: config.get("nodemailer.service"),
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: "Reset Link",
      html: html,
    };
    return await transporter.sendMail(mailOptions);
  },

  sendEmailOtp: async (email, otp) => {
    var sub = `Use the One Time Password(OTP) ${otp} to verify your accoount.`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: email,
      subject: "Otp for verication",
      text: sub,
      // html: html
    };
    return await transporter.sendMail(mailOptions);
  },
};
