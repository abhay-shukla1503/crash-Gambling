const jwt = require("jsonwebtoken");
const key = "gambling";
const User = require("/Users/admin/Desktop/crash Gambling/models/user");

async function verifyToken(token) {
    try {
      const decoded = jwt.verify(token, key);
      return decoded;
    } catch (error) {
      console.log("error in token:====>>>", error);
      res.send("Invalid token ");
    }
  }

  module.exports = async(req,res,next) =>{
    const token = req.headers["token"];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    try {
      if (!token) {
        return res.status(400).json({
          statusCode: 400,
          responseMessage: "Token required",
        });
      }
  
      const decodedToken = await verifyToken(token);
  
      if (decodedToken) {
        const user = await User.findOne({
          _id: decodedToken.id,
          status: "ACTIVE",
        });
  
        if (!user) {
          return res.status(404).json({
            statusCode: 404,
            responseMessage: "User not found.",
          });
        }
  
        const currentDate = new Date();
        console.log("cDate==============", currentDate);
        currentDate.setHours(currentDate.getHours() - 8); // Subtract 8 hours
        const newDate = currentDate.toISOString();
        console.log("currentDate=============", currentDate);
        console.log("newDate==============", newDate);
        const query = {
          status: "ACTIVE",
          createdAt: { $gte: newDate },
        };
        let options = {
          page: Number(page) || 1,
          limit: Number(limit) || 15,
          sort: { profit: -1 },
        };
        const result = await User.paginate(query, options);
        return res.status(200).json({
          statusCode: 200,
          responseMessage: "User Found",
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