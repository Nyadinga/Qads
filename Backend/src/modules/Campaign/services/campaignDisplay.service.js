const campaignRepository = require("../campaign.repository");

const getActiveCampaigns = async () => {
  const campaigns = await campaignRepository.findActiveCampaigns();

  return campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    countryCode: campaign.country_code,
    currencyCode: campaign.currency_code,
    productName: campaign.product_name,
    unitPriceRange: campaign.unit_price_range,
    destination: campaign.destination,
    allocatedBudget: campaign.allocated_budget,
    budgetSpent: campaign.budget_spent,
    advertiserCpc: campaign.advertiser_cpc,
    effectiveCpc: campaign.effective_cpc,
    estimatedValidatedClickCapacity:
      campaign.estimated_validated_click_capacity,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    status: campaign.status,
    canonicalShortUrl: campaign.canonical_short_url,
    createdAt: campaign.created_at,
    category: campaign.category
      ? {
          id: campaign.category.id,
          name: campaign.category.name,
          status: campaign.category.status,
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

module.exports = {
  getActiveCampaigns,
};