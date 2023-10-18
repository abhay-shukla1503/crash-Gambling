const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const bip39 = require("bip39");
let count = 0;
const mnemonic =
  "ox ride receive plunge gap rack february search cigar cereal vacant slow";
  const { BIP32Factory } = require("bip32");
  const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider; //This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider("https://nile.trongrid.io"); //Full node http endpoint
const solidityNode = new HttpProvider("https://nile.trongrid.io"); // Solidity node http endpoint
const eventServer = new HttpProvider("https://nile.trongrid.io"); //solidity node http endpoint
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
async function generateTRXWallet() {
    try {
      const seednew = await bip39.mnemonicToSeed(mnemonic);
      console.log("seed ==>", bip32.fromSeed(seednew));
      const node = bip32.fromSeed(seednew);
      let countvalue = count ? parseInt(count) : 0;
      const child = node.derivePath(`m/44'/195'/0'/0/${countvalue}`);
      const privateKey = child.privateKey.toString("hex");
      const address = await tronWeb.address.fromPrivateKey(privateKey);
  
      let totalwallet = [];
      let importWallet = [];
      let accountName = `Account ${countvalue}`;
  
      if (countvalue === 0) {
        accountName = "TRXMainAccount";
      }
  
      totalwallet.push({
        address: address,
        privateKey: privateKey,
        balance: 0,
        accountName: accountName,
      });
  
      let Body = {
        count: totalwallet.length + countvalue,
        name: "TRX",
        totalwallet: totalwallet,
        importWallet: importWallet,
      };
      count++;
      console.log("..........count", count);
      return {
        statusCode: 200,
        responseMessage: "Wallet generated successfully.",
        responseResult: Body,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 501,
        responseMessage: "Something went wrong.",
        responseResult: error,
      };
    }
  }

module.exports = async (req,res) => {
        try {
          if (req.body.username.length < 3 || req.body.password < 3) {
            return res.status(404).json({
              statusCode: 404,
              responseMessage: "Invalid userName or password",
            });
          }
          const existingUser = await User.findOne({
            $or: [{ email: req.body.email }, { username: req.body.username }],
          });
      
          if (existingUser) {
            if (existingUser.username == req.body.username) {
              return res.status(409).json({
                statusCode: 409,
                responseMessage: "Username already exists",
              });
            } else if (existingUser.email === req.body.email) {
              return res.status(409).json({
                statusCode: 409,
                responseMessage: "email already exists",
              });
            }
          }
          const hashedPassword = bcrypt.hashSync(req.body.password, 10);
          let account = await generateTRXWallet();
          const totalwallet = account.responseResult.totalwallet;
          var address = "";
          var key = "";
          if (totalwallet && totalwallet.length > 0) {
            totalwallet.forEach((wallet) => {
              address = wallet.address;
              key = wallet.privateKey;
            });
            const today = new Date();
            const currentDate = today.toISOString().split("T")[0];
            const balance = await tronWeb.trx.getBalance(address);
      
            const newUser = new User({
              username: req.body.username,
              password: hashedPassword,
              email: req.body.email,
              profession: req.body.profession,
              address: address,
              privateKey: key,
              balance: balance,
              dateOfJoining: currentDate,
            });
            await newUser.save();
          }
          return res.status(200).json({
            statusCode: 200,
            responseMessage: "Account generated Successfully",
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            statusCode: 505,
            responseMessage: "Something went wrong",
            error: error,
          });
        }
}