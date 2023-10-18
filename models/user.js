const mongoose = require("mongoose");
const userType = require("../userType");
const mongoosePaginate = require("mongoose-paginate");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpires: {
      type: Number,
    },
    otp: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    otpExpireTime: {
      type: Date,
    },
    email: {
      type: String,
    },
    profession: {
      type: String,
    },
    password: {
      type: String,
    },
    balance: {
      type: Number,
    },
    bet_amount: {
      type: Number,
      default: 0,
    },
    payout_multiplier: {
      type: Number,
      default: 0,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    privateKey: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCK", "DELETE"],
      default: "ACTIVE",
    },
    userType: {
      type: String,
      default: userType.USER,
    },
    profilePic: {
      type: String,
    },
    twofactorauthentication: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String,
    },
    url: {
      type: String,
    },
    dateOfJoining: {
      type: String,
    },
    wagered: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);

async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ userType: userType.ADMIN, status: "ACTIVE" });

    if (!existingAdmin) {
      const adminData = {
        userType: userType.ADMIN,
        username: "charu123",
        email: "charulata.yadav@indicchain.com",
        password: bcrypt.hashSync("Mobiloitte@1"),
        otpVerified: true,
        profession: "Admin Engn",
      };

      const newAdmin = new User(adminData);
      await newAdmin.save();
      console.log("Default admin created", newAdmin);
    } else {
      console.log("Default Admin already exists.");
    }
  } catch (err) {
    console.error("Default admin creation error", err);
  }
}

createDefaultAdmin();

module.exports = User;