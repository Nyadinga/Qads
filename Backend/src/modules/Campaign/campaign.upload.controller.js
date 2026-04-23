const {
  uploadMultipleCampaignMediaToDrive,
} = require("./services/googleDrive.service");

const uploadCampaignMediaHandler = async (req, res, next) => {
  try {
    const files = req.files || [];

    if (!files.length) {
      const error = new Error("At least one media file is required.");
      error.statusCode = 400;
      throw error;
    }

    const mediaRefs = await uploadMultipleCampaignMediaToDrive(files);

    return res.status(201).json({
      success: true,
      message: "Uploaded successfully.",
      data: {
        mediaRefs,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCampaignMediaHandler,
};