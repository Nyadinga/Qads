const {
  saveNewDraftCampaign,
  updateDraftCampaign,
} = require("./advertiserDraft.service");

const saveNewDraftCampaignHandler = async (req, res, next) => {
  try {
    const campaign = await saveNewDraftCampaign({
      ownerId: req.auth.userId,
      payload: req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Campaign draft saved successfully.",
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          updatedAt: campaign.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateDraftCampaignHandler = async (req, res, next) => {
  try {
    const campaign = await updateDraftCampaign({
      campaign: req.campaign,
      ownerId: req.auth.userId,
      payload: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign draft updated successfully.",
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          updatedAt: campaign.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveNewDraftCampaignHandler,
  updateDraftCampaignHandler,
};