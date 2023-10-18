const User = require("/Users/admin/Desktop/crash Gambling/models/user");
const jwt = require("jsonwebtoken");
const key = "gambling";
const helpStaticModel = require("/Users/admin/Desktop/crash Gambling/models/helpStatic");

async function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, key);
      return decoded;
    } catch (error) {
      console.log("errorin token:====>>>", error);
      res.send("Invalid token ");
    }
  }

module.exports = async(req,res,next) =>{
    try {
      const { staticId, title, description } = req.body;
      const token = req.headers["token"];
      if (!token) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token is required",
        });
      }
      const decodedToken = await verifyToken(token);
      if (decodedToken) {
        const user = await User.findOne({
          _id: decodedToken.id,
          status: "ACTIVE",
          userType: userType.ADMIN,
        });
        if (!user) {
          return res
            .status(404)
            .json({ statusCode: 400, responseMessage: "User not found." });
        }
        let staticRes = await helpStaticModel.findOne({
          _id: staticId,
          status: "ACTIVE",
        });
        if (!staticRes) {
          return res
            .status(404)
            .json({ statusCode: 400, responseMessage: "Data not found." });
        }
        const data = {
          title: title,
          description: description,
        };
        var result = await helpStaticModel.findOneAndUpdate(
          { _id: staticRes._id },
          data
        );
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "Data Found",
          responseresult: result,
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          responseMessage: "Incorrect token",
        });
      }
    } catch (error) {
      console.log("error==>>", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "An error occurred while processing your request",
        error: error,
      });
    }
  }