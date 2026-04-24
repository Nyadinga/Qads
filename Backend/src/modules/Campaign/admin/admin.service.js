const campaignRepository = require("../campaign.repository");

const getPendingCampaigns = async () => {
  const campaigns = await campaignRepository.findPendingCampaigns();

  return campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    countryCode: campaign.country_code,
    currencyCode: campaign.currency_code,
    productName: campaign.product_name,
    unitPriceRange: campaign.unit_price_range,
    destination: campaign.destination,
    destinationValue: campaign.destination_value,
    allocatedBudget: campaign.allocated_budget,
    budgetSpent: campaign.budget_spent,
    minCpc: campaign.min_cpc,
    advertiserCpc: campaign.advertiser_cpc,
    effectiveCpc: campaign.effective_cpc,
    estimatedValidatedClickCapacity:
      campaign.estimated_validated_click_capacity,
    basePlatformPercentage: campaign.base_platform_percentage,
    extraPlatformPercentage: campaign.extra_platform_percentage,
    finalPlatformPercentage: campaign.final_platform_percentage,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    status: campaign.status,
    submittedAt: campaign.submitted_at,
    createdAt: campaign.created_at,
    category: campaign.category
      ? {
          id: campaign.category.id,
          name: campaign.category.name,
          status: campaign.category.status,
          minCpc: campaign.category.min_cpc,
          extraPlatformPercentage:
            campaign.category.extra_platform_percentage,
        }
      : null,
    owner: campaign.campaignOwner
      ? {
          id: campaign.campaignOwner.id,
          firstName: campaign.campaignOwner.first_name,
          lastName: campaign.campaignOwner.last_name,
          username: campaign.campaignOwner.username,
          email: campaign.campaignOwner.email,
          phone: campaign.campaignOwner.phone,
        }
      : null,
    media: Array.isArray(campaign.media)
      ? campaign.media.map((item) => ({
          id: item.id,
          mediaType: item.media_type,
          fileUrl: item.file_url,
          previewUrl: item.preview_url,
          fileName: item.file_name,
          mimeType: item.mime_type,
          fileSizeBytes: item.file_size_bytes,
          displayOrder: item.display_order,
        }))
      : [],
  }));
};

const approveCampaign = async ({ campaign }) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const updatedCampaign = await campaignRepository.approveCampaign(
      campaign,
      transaction
    );

    await transaction.commit();

    return updatedCampaign;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }

    throw error;
  }
};

/// rejection logic for a campaign
const rejectCampaign = async ({ campaign, rejectionReason }) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const updatedCampaign = await campaignRepository.rejectCampaign(
      campaign,
      rejectionReason,
      transaction
    );

    await transaction.commit();

    return updatedCampaign;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }

    throw error;
  }
};

module.exports = {
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign
};