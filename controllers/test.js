app.post("/register", async (req, res, next) => {
    try {
      const { email, username, proffession, password } = req.body;
      if (!email && !username && !proffession && !password) {
        res
          .status(400)
          .json({
            statusCode: errorCode.badrequest,
            responseMessage: responseMessage.REQUIRED,
          });
      }
      const isUser = await User.findOne({
        email: req.body.email,
        username: req.body.username,
      });
      if (isUser) {
        if (isUser.username === username) {
          res
            .status(403)
            .json({
              statusCode: errorCode.badrequest,
              success: false,
              responseMessage: responseMessage.USERNAME_UNIQUE,
            });
        } else if (isUser.email === email) {
          res
            .status(403)
            .json({
              statusCode: errorCode,
              responseMessage: responseMessage.EMAIL_EXIST,
            });
        }
      } else {
        let account = await generateTRXWallet(res);
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        const totalwallet = account.responseResult.totalwallet;
        var address = "";
        var key = "";
        if (totalwallet && totalwallet.length > 0) {
          totalwallet.forEach((wallet) => {
            address = wallet.address;
            key = wallet.privateKey;
          });
          const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            profession: req.body.profession,
            address: address,
            privateKey: key,
          });
          let saveResult = await newUser.save();
          let obje = {
            email: saveResult.email,
            username: saveResult.username,
            _id: saveResult._id,
          };
          res
            .status(200)
            .json({
              statusCode: successCode.successCode,
              message: responseMessage.USER_CREATED,
              result: obje,
            });
        } else {
          console.log("No wallets found in the response.");
          res
            .status(404)
            .json({
              statusCode: errorCode.notfound,
              responseMessage: responseMessage.DATA_NOT_FOUND,
            });
        }
      }
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  });
  