const bip39 = require("bip39");
const { BIP32Factory } = require("bip32");
const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider; //This provider is optional, you can just use a url for the nodes instead
const fullNode = new HttpProvider("https://nile.trongrid.io"); //Full node http endpoint
const solidityNode = new HttpProvider("https://nile.trongrid.io"); // Solidity node http endpoint
const eventServer = new HttpProvider("https://nile.trongrid.io"); //solidity node http endpoint
const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);

const generateTRXWallet = async (req, res) => {
  try {
    const seednew = await bip39.mnemonicToSeed(req.body.mnemonic);
    console.log("seed ==>", bip32.fromSeed(seednew));
    const node = bip32.fromSeed(seednew);
    let countvalue = req.body.count ? req.query.count : 0;
    const child = node.derivePath(`m/44'/195'/0'/0/${countvalue}`);
    const privateKey = child.privateKey.toString("hex");
    console.log("privateKey==>", privateKey);
    const address = await tronWeb.address.fromPrivateKey(privateKey);
    console.log("address==>", address);
    let totalwallet = [];
    let importWallet = [];
    if (req.query.accountName === undefined || req.query.accountName === "") {
      req.query.accountName = `Account ${req.query.count}`;
    }
    if (countvalue === 0) {
      req.query.accountName = `TRXMainAccount`;
    }

    totalwallet.push({
      address: address,
      privateKey: privateKey,
      balance: 0,
      accountName: req.query.accountName,
    });
    let Body = {};
    if (countvalue > 0) {
      Body = {
        count:
          totalwallet && totalwallet.length
            ? parseInt(totalwallet.length) + parseInt(countvalue)
            : parseInt(countvalue),
        name: "TRX",
        totalwallet: totalwallet,
        importWallet: importWallet,
      };
    } else {
      console.log("Body--->222", totalwallet);

      Body = {
        count: 1,
        name: "TRX",
        totalwallet: totalwallet,
        importWallet: importWallet,
      };
    }
    return res.send({
      responseCode: 200,
      resposenMessage: "Wallet generated successfully.",
      responseResult: Body,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      responseCode: 501,
      resposenMessage: "Something went wrong!!!",
      responseResult: `${error}`,
    });
  }
};

module.exports = {
  generateTRXWallet,
};
