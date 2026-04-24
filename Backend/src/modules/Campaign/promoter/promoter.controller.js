const {
  getActiveCampaigns,
} = require("../services/campaignDisplay.service");

const getActiveCampaignsHandler = async (req, res, next) => {
  try {
    const campaigns = await getActiveCampaigns();

    return res.status(200).json({
      success: true,
      message: "Active campaigns fetched successfully.",
      data: {
        campaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getActiveCampaignsHandler,
};