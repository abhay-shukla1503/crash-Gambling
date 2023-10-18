const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const contactUs = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "BLOCK", "DELETE"],
    default: "ACTIVE",
  },
  message:{
    type :String ,
  }
 
});

module.exports = mongoose.model("contactUs", contactUs);


