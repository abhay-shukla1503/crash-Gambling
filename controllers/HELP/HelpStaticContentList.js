const helpStaticModel = require("/Users/admin/Desktop/crash Gambling/models/helpStatic");

module.exports = async(req,res,next) =>{
    try {
      var result = await helpStaticModel.find({ status: "ACTIVE" });
      if (result.length == 0) {
        return res
          .status(404)
          .json({ statusCode: 400, responseMessage: "Data not found." });
      }
      return res.status(200).json({
        statusCode: 200,
        responseMessage: "Data Found",
        responseresult: result,
      });
    } catch (error) {
      console.log("error==>>", error);
      return res.status(500).json({
        statusCode: 500,
        responseMessage: "An error occurred while processing your request",
        error: error,
      });
    }
  }