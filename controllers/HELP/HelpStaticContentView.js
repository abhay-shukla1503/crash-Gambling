const helpStaticModel = require("/Users/admin/Desktop/crash Gambling/models/helpStatic");

module.exports = async(req,res,next) =>{
    try {
      const { staticId } = req.query;
      if (!staticId) {
        return res
          .status(400)
          .json({ statusCode: 400, responseMessage: "staticId required" });
      }
      var result = await helpStaticModel.findOne({
        _id: staticId,
        status: "ACTIVE",
      });
      if (result.length == 0) {
        return res
          .status(400)
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