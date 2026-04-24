const {
  getCategoryPricingContext,
} = require("../services/campaignCategory.service");
const {
  resolveCampaignCpc,
} = require("../services/campaignCpc.service");
const {
  resolvePlatformCommission,
} = require("../services/campaignCommission.service");
const {
  createCampaign,
} = require("../services/campaignCreation.service");

const {
  uploadMultipleCampaignMediaToDrive,
} = require("../services/googleDrive.service");


const {
  getAdvertiserCampaigns,
  getAdvertiserCampaignDetail,
  pauseCampaign,
  resumeCampaign,
  updateAdvertiserCampaign,
} = require("./advertiser.service");



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

const getAdvertiserCampaignsHandler = async (req, res, next) => {
  try {
    const campaigns = await getAdvertiserCampaigns({
      ownerId: req.auth.userId,
      status: req.query.status || null,
    });

    return res.status(200).json({
      success: true,
      message: "Advertiser campaigns fetched successfully.",
      data: {
        campaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};



const previewCampaignPricing = async (req, res, next) => {
  try {
    const category = await getCategoryPricingContext({
      categoryId: req.body.categoryId,
      newCategoryName: req.body.newCategoryName,
    });

    const pricing = resolveCampaignCpc({
      countryCode: req.body.countryCode,
      categoryMinCpc: category.min_cpc,
      unitPriceRange: req.body.unitPriceRange,
      destination: req.body.destination,
      advertiserCpc: req.body.advertiserCpc,
      budget: req.body.budget,
    });

    const commission = resolvePlatformCommission({
      extraPlatformPercentage: category.extra_platform_percentage,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign pricing preview generated successfully.",
      data: {
        category: {
          id: category.id,
          name: category.name,
          status: category.status,
          minCpc: Number(category.min_cpc),
          extraPlatformPercentage: Number(
            category.extra_platform_percentage
          ),
        },
        pricing,
        commission,
      },
    });
  } catch (error) {
    next(error);
  }
};



const createCampaignHandler = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      const error = new Error("Unauthorized request.");
      error.statusCode = 401;
      throw error;
    }

    const result = await createCampaign({
      userId: req.auth.userId,
      payload: req.body,
    });
    return res.status(201).json({
      success: true,
      message:
        req.body.action === "launch"
          ? "Campaign submitted for review successfully."
          : "Campaign draft created successfully.",
      data: {
        campaign: result.campaign,
        category: {
          id: result.category.id,
          name: result.category.name,
          status: result.category.status,
        },
        pricing: result.pricing,
        commission: result.commission,
      },
    });
  } catch (error) {
    next(error);
  }
};

const pauseCampaignHandler = async (req, res, next) => {
  try {
    const campaign = await pauseCampaign({
      campaign: req.campaign,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign paused successfully.",
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          pausedAt: campaign.paused_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


const getAdvertiserCampaignDetailHandler = async (req, res, next) => {
  try {
    const campaign = await getAdvertiserCampaignDetail({
      campaignId: req.params.id,
      ownerId: req.auth.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Advertiser campaign details fetched successfully.",
      data: {
        campaign,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resumeCampaignHandler = async (req, res, next) => {
  try {
    const campaign = await resumeCampaign({
      campaign: req.campaign,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign resumed successfully.",
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          status: campaign.status,
          pausedAt: campaign.paused_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAdvertiserCampaignHandler = async (req, res, next) => {
  try {
    const campaign = await updateAdvertiserCampaign({
      campaignId: req.params.id,
      ownerId: req.auth.userId,
      payload: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Campaign updated and submitted for review successfully.",
      data: {
        campaign,
      },
    });
  } catch (error) {
    next(error);
  }
};





module.exports = {
  previewCampaignPricing,
  createCampaignHandler,
  uploadCampaignMediaHandler,
  getAdvertiserCampaignsHandler,
  pauseCampaignHandler,
  getAdvertiserCampaignDetailHandler,
  resumeCampaignHandler,
  updateAdvertiserCampaignHandler
};