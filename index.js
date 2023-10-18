const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
const nodemailer = require("nodemailer");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const key = "gambling";
const port = 3000;
const Game_loop = require("./models/game_loop");
const swaggerSpec = require("./swagger");
const swaggerUi = require("swagger-ui-express");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
require("dotenv").config();
const routes = require('./Routes.js');







let count = 0;
const mnemonic =
  "ox ride receive plunge gap rack february search cigar cereal vacant slow";
//*************************************swagger***********************************************************/

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mobiloitte.node@gmail.com",
    pass: "wdbakhorlxmmqrhg",
  },
});
function generateRandomOTP() {
  const characters = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters.charAt(randomIndex);
  }
  return otp;
}


const { Server } = require("socket.io");
const http = require("http");


mongoose.connect(
  process.env.MONGOOSE_DB_LINK,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(`Error in mongodb connection ${err.message}`);
    }
    console.log("Mongodb connection established");
  }
);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  socket.on("clicked", (data) => {});
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser(process.env.PASSPORT_SECRET));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

app.use('/',routes);










// *********************** GAME LOOP VARIABLES ******************************//
let phase_start_time = Date.now();
const messages_list = [];
let live_bettors_table = [];
let betting_phase = true;
let game_phase = false;
let cashout_phase = true;
let game_crash_value = -69;
let sent_cashout = true; 
 


// *********************** GAME INTEGRATION ******************************//

const cashout = async () => {
  theLoop = await Game_loop.findOne();
  if (theLoop) {
    var playerIdList = theLoop.active_player_id_list;
  }
  crash_number = game_crash_value;
  for (const playerId of playerIdList) {
    const currUser = await User.findById(playerId);
    if (currUser.payout_multiplier <= crash_number) {
      currUser.balance += currUser.bet_amount * currUser.payout_multiplier;
      await currUser.save();
    }
  }
  theLoop.active_player_id_list = [];
  await theLoop.save();
};

const pat = setInterval(async () => {
  await loopUpdate();
}, 1000);


// *********************** GAME LOOP ******************************//
const loopUpdate = async () => {
  let time_elapsed = (Date.now() - phase_start_time) / 1000.0;
  console.log("==============================>>>>>371", time_elapsed);

  if (betting_phase) {
    if (time_elapsed > 6) {
      sent_cashout = false;
      betting_phase = false;
      game_phase = true;
      io.emit("start_multiplier_count");
      phase_start_time = Date.now();
    }
  } else if (game_phase) {
    current_multiplier = (1.0024 * Math.pow(1.0718, time_elapsed)).toFixed(2);
    if (current_multiplier > game_crash_value) {
      io.emit("stop_multiplier_count", game_crash_value.toFixed(2));
      game_phase = false;
      cashout_phase = true;
      phase_start_time = Date.now();
    }
  } else if (cashout_phase) {
    if (!sent_cashout) {
      cashout();
      sent_cashout = true;
      right_now = Date.now();
      const update_loop = await Game_loop.findOne();
      await update_loop.updateOne({
        $push: { previous_crashes: game_crash_value },
      });
      await update_loop.updateOne({ $unset: { "previous_crashes.0": 1 } });
      await update_loop.updateOne({ $pull: { previous_crashes: null } });
      const the_round_id_list = update_loop.round_id_list;
      await update_loop.updateOne({
        $push: {
          round_id_list: the_round_id_list[the_round_id_list.length - 1] + 1,
        },
      });
      await update_loop.updateOne({ $unset: { "round_id_list.0": 1 } });
      await update_loop.updateOne({ $pull: { round_id_list: null } });
    }

    if (time_elapsed > 3) {
      cashout_phase = false;
      betting_phase = true;
      let randomInt = Math.floor(Math.random() * (9999999999 - 0 + 1) + 0);
      if (randomInt % 33 == 0) {
        game_crash_value = 1;
      } else {
        random_int_0_to_1 = Math.random();
        while (random_int_0_to_1 == 0) {
          random_int_0_to_1 = Math.random;
        }
        game_crash_value = 0.01 + 0.99 / random_int_0_to_1;
        game_crash_value = Math.round(game_crash_value * 100) / 100;
      }
      io.emit("update_user");
      let theLoop = await Game_loop.findOne();
      if (theLoop) {
        io.emit("crash_history", theLoop.previous_crashes);
        io.emit("get_round_id_list", theLoop.round_id_list);
      }
      io.emit("start_betting_phase");
      io.emit("testingvariable");
      live_bettors_table = [];
      phase_start_time = Date.now();
    }
  }
};










//********************************common function***************************** */
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
async function generateToken(payload) {
  return jwt.sign(payload, key, { expiresIn: "24h" });
} 

async function base64encoded(data) {
  try {
    return await qrcode.toDataURL(data);
  } catch (error) {
    return error;
  }
}

async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, key);
    return decoded;
  } catch (error) {
    console.log("errorin token:====>>>", error);
    res.send("Invalid token ");
  }
}

/**Give Live bettors list  */
app.get("/retrieve_active_bettors_list", async (req, res) => {
  io.emit("receive_live_betting_table", JSON.stringify(live_bettors_table));
  console.log("????????????????>>>>>>>>>>>>", live_bettors_table);
  return;
});

/** It will give history of rocket */
app.get("/retrieve_bet_history", async (req, res) => {
  let theLoop = await Game_loop.findOne();
  io.emit("crash_history", theLoop.previous_crashes);
  return;
});

/** It will give game Status of the game */
app.get("/get_game_status", async (req, res) => {
  let theLoop = await Game_loop.findOne();
  io.emit("crash_history", theLoop.previous_crashes);
  io.emit("get_round_id_list", theLoop.round_id_list);
  if (betting_phase == true) {
    res.json({ phase: "betting_phase", info: phase_start_time });
    return;
  } else if (game_phase == true) {
    res.json({ phase: "game_phase", info: phase_start_time });
    return;
  }
});

// *********************** SERVER ******************************//

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});