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
        responseMessage: "Something with wrong.",
        responseResult: error,
      };
    }
  }

export default generateTRXWallet;