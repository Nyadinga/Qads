const campaignRepository = require("../campaign.repository");

const DEFAULT_NEW_CATEGORY_MIN_CPC = 1;
const DEFAULT_NEW_CATEGORY_EXTRA_PLATFORM_PERCENTAGE = 4;

const normalizeCategoryName = (name) => {
  return String(name || "").trim().replace(/\s+/g, " ");
};

const getCategoryPricingContext = async ({
  categoryId,
  newCategoryName,
  transaction = null,
}) => {
  if (categoryId) {
    const category = await campaignRepository.findCampaignCategoryById(
      categoryId,
      transaction
    );

    if (!category) {
      const error = new Error("Selected category was not found.");
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  if (!newCategoryName) {
    const error = new Error("A category is required.");
    error.statusCode = 422;
    throw error;
  }

  const normalizedName = normalizeCategoryName(newCategoryName);

  const existingCategory = await campaignRepository.findCampaignCategoryByName(
    normalizedName,
    transaction
  );

  if (existingCategory) {
    return existingCategory;
  }

  return {
    id: null,
    name: normalizedName,
    status: "unknown",
    min_cpc: DEFAULT_NEW_CATEGORY_MIN_CPC,
    extra_platform_percentage: DEFAULT_NEW_CATEGORY_EXTRA_PLATFORM_PERCENTAGE,
  };
};

const resolveCampaignCategory = async ({
  categoryId,
  newCategoryName,
  userId,
  transaction,
}) => {
  if (categoryId) {
    const category = await campaignRepository.findCampaignCategoryById(
      categoryId,
      transaction
    );

    if (!category) {
      const error = new Error("Selected category was not found.");
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  if (!newCategoryName) {
    const error = new Error("A category is required.");
    error.statusCode = 422;
    throw error;
  }

  const normalizedName = normalizeCategoryName(newCategoryName);

  const existingCategory = await campaignRepository.findCampaignCategoryByName(
    normalizedName,
    transaction
  );

  if (existingCategory) {
    return existingCategory;
  }

  return await campaignRepository.createCampaignCategory(
    {
      name: normalizedName,
      status: "proposed",
      min_cpc: DEFAULT_NEW_CATEGORY_MIN_CPC,
      extra_platform_percentage:
        DEFAULT_NEW_CATEGORY_EXTRA_PLATFORM_PERCENTAGE,
      created_by: userId || null,
    },
    transaction
  );
};

module.exports = {
  getCategoryPricingContext,
  resolveCampaignCategory,
};