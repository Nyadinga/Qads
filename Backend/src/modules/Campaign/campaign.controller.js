const {
  getCategoryPricingContext,
} = require("./services/campaignCategory.service");
const {
  resolveCampaignCpc,
} = require("./services/campaignCpc.service");
const {
  resolvePlatformCommission,
} = require("./services/campaignCommission.service");
const {
  createCampaign,
} = require("./services/campaignCreation.service");

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

module.exports = {
  previewCampaignPricing,
  createCampaignHandler,
};