const campaignService = require("./service/campaignCreation.Service");

const createNewCampaign = async (req, res) => {
  try {
    const userId = req.user?.id || 1;// Matches your manual id check
    const campaign = await campaignService.createCampaign(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getMyCampaigns = async (req, res) => {
  try {
    const userId = req.params.userId;
    const campaigns = await campaignService.getUserCampaigns(userId);

    res.status(200).json({
      success: true,
      message: "Campaigns retrieved successfully",
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

module.exports = { createNewCampaign, getMyCampaigns };