const express = require("express");

const router = express.Router();

///////////////////////////////////////////AUTH//////////////////////////////////////////////////////////
const register = require("./controllers/AUTH/Register");
const loginRoute = require("./controllers/AUTH/Login");
const verifyOtpRoute = require("./controllers/AUTH/VerifyOTP");
const forgot = require("./controllers/AUTH/ForgotPassword");
const reset = require("./controllers/AUTH/ResetPassword");

//////////////////////////////////////////ACCOUNT///////////////////////////////////////////////////////
const updatePassword = require("./controllers/ACCOUNT/UpdatePassword");
const getUserProfile = require("./controllers/ACCOUNT/GetUserProfile");
const updatemail = require("./controllers/ACCOUNT/UpdateEmail");
const deleteaccount = require("./controllers/ACCOUNT/DeleteAccount")
const twoFA = require("./controllers/ACCOUNT/2FA");
const verifyTwoFA = require("./controllers/ACCOUNT/Verify2FA");

//////////////////////////////////////////TRON INTEGRATION///////////////////////////////////////////////////////
const withdrawtrx = require("./controllers/TRON INTEGRATION/WithdrawTrx");
const createwithdrawrequest = require("./controllers/TRON INTEGRATION/CreateWithdrawRequest");
const verifywithdrawOTP = require("./controllers/TRON INTEGRATION/VerifyWithdrawOTP");
const accountbalance = require("./controllers/TRON INTEGRATION/AccountBalance");
const deposit = require("./controllers/TRON INTEGRATION/Deposit");
const tips = require("./controllers/TRON INTEGRATION/Tips");

//////////////////////////////////////////HISTORY///////////////////////////////////////////////////////
const deposithistory = require("./controllers/HISTORY/DepositHistory");
const withdrawhistory = require("./controllers/HISTORY/WithdrawHistory");
const mybets  =require("./controllers/HISTORY/MyBets");
const tipshistory = require("./controllers/HISTORY/TipsHistory");

/////////////////////////////////////////WALLET/////////////////////////////////////////////////////////
const getuseraddress = require("./controllers/WALLET/GetUserAddress");
const getadminaddress = require("./controllers/WALLET/GetAdminAddress");

/////////////////////////////////////////HELP/////////////////////////////////////////////////////////
const helpstaticcontentlist = require("./controllers/HELP/HelpStaticContentList");
const helpstaticcontentview = require("./controllers/HELP/HelpStaticContentView");
const editstaticcontent = require("./controllers/HELP/EditStaticContent");
const contactus = require("./controllers/HELP/ContactUs");

/////////////////////////////////////////LOGOUT/////////////////////////////////////////////////////////
const logout = require("./controllers/LOGOUT/Logout");

/////////////////////////////////////////CHATS///////////////////////////////////////////////
const sendmessage = require("./controllers/CHATS/SendMessage");
const getchat = require("./controllers/CHATS/GetChat");

//////////////////////////////////////GAME INTEGRATION///////////////////////////////////////
const generatecashvalue = require("./controllers/GAME INTEGRATION/GenerateCashValue");
const sendmannualbet = require("./controllers/GAME INTEGRATION/SendManualBet");
const autocashoutearly = require("./controllers/GAME INTEGRATION/AutoCashoutEarly");
const mannualcashoutearly = require("./controllers/GAME INTEGRATION/MannualCashoutEarly");
const retrieve = require("./controllers/GAME INTEGRATION/Retrieve");
const calculatewinnings = require("./controllers/GAME INTEGRATION/CalculateWinnings");
const multiplybetamount = require("./controllers/GAME INTEGRATION/MultiplyBetAmount");

/////////////////////////////////////LEADERBOARD////////////////////////////////////////////
const leaderboard = require("./controllers/LEADERBOARD/Leaderboard");



/************************************AUTH **************************************************/
router.post("/register",register);
router.post("/login",loginRoute);
router.post("/verify-otp",verifyOtpRoute);
router.post("/forgot-password",forgot);
router.put("/reset-password",reset); //put

/************************************Account ************************************************/
router.put("/update-password",updatePassword);//put
router.get("/get-user-profile",getUserProfile);//get
router.put("/update-email",updatemail);//put
router.delete("/delete-account",deleteaccount);//delete
router.get("/twoFA",twoFA);//get
router.post("/verify-twofa",verifyTwoFA);//post

/************************************TRON INTEGRATION ************************************************/
router.post("/withdraw-trx",withdrawtrx);//post
router.post("/create-withdraw-request",createwithdrawrequest);//post
router.post("/verify-withdraw-otp",verifywithdrawOTP);//post
router.get("/account-balance",accountbalance);//get
router.post("/deposit",deposit);//post
router.post("/tips",tips);//post

/************************************HISTORY ************************************************/
router.get("/deposit-history",deposithistory);//get
router.get("/withdraw-history",withdrawhistory);//get
router.get("/my-bets",mybets);//get
router.get("/tips-history",tipshistory);//get

/************************************WALLET************************************************/
router.get("/get-user-address",getuseraddress);//get
router.get("/get-admin-address",getadminaddress);//get

/************************************HELP ************************************************/
router.get("/help-static-content-list",helpstaticcontentlist);//get
router.get("/help-static-content-view",helpstaticcontentview);//get
router.put("/edit-static-content",editstaticcontent);//put
router.post("/contact-us",contactus);//post

/************************************LOGOUT ************************************************/
router.post("/logout",logout);//post

// *********************** CHATS ******************************//
router.post("/send-message",sendmessage);//post
router.get("/get-chat",getchat);//get

// *********************** GAME INTEGRATION ******************************//
router.get("/generate-cash-value",generatecashvalue);//get
router.post("/send-mannual-bet",sendmannualbet);//post
router.get("/auto-cashout-early",autocashoutearly);//get
router.get("/mannual-cashout-early",mannualcashoutearly);//get
router.get("/retrieve",retrieve);//get
router.get("/calculate-winnings",calculatewinnings);//get
router.get("/multiply-bet-amount",multiplybetamount);//get

// *********************** GAME INTEGRATION ******************************//
router.get("/leaderboard",leaderboard);//get

module.exports = router;