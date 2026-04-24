const { getPendingCampaigns } = require("./admin.service");

const getPendingCampaignsHandler = async (req, res, next) => {
  try {
    const campaigns = await getPendingCampaigns();

    return res.status(200).json({
      success: true,
      message: "Pending campaigns fetched successfully.",
      data: {
        campaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};

const approveCampaignHandler = async (req, res, next) => {
  try {
    const campaign = await approveCampaign({
      campaign: req.campaign,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign approved successfully.",
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          approvedAt: campaign.approved_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const rejectCampaignHandler = async (req, res, next) => {
  try {
    const campaign = await rejectCampaign({
      campaign: req.campaign,
      rejectionReason: req.body.rejectionReason,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign rejected successfully.",
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          rejectedAt: campaign.rejected_at,
          rejectionReason: campaign.rejection_reason,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingCampaignsHandler,
  approveCampaignHandler,
  rejectCampaignHandler,
};