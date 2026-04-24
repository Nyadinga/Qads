const campaignRepository = require("../campaign.Repository");

const createCampaign = async (userId, data) => {
  // Use a fallback for userId during testing if authentication isn't active
  const activeUserId = userId || 1;

  const campaignPayload = {
    user_id: activeUserId,
    title: data.title,
    description: data.description,
    // Fix: Mapping from snake_case JSON to snake_case Database keys
    destination_type: data.destination_type,
    destination_value: data.destination_value,
    allocated_budget: data.allocated_budget || 0,
    min_cpc: data.min_cpc,
    advertiser_cpc: data.advertiser_cpc,
    effective_cpc: data.advertiser_cpc, // Database requirement: cannot be null
    status: data.status || "draft"
  };

  if (campaignPayload.status === "pending_approval") {
    campaignPayload.submitted_at = new Date();
  }

  const campaign = await campaignRepository.createCampaign(campaignPayload);
  return mapCampaignResponse(campaign);
};

const getUserCampaigns = async (userId) => {
  const activeUserId = userId || 1;
  const campaigns = await campaignRepository.findCampaignsByUserId(activeUserId);
  return campaigns.map(campaign => mapCampaignResponse(campaign));
};

// Helper to format the response back to camelCase for the frontend
const mapCampaignResponse = (campaign) => ({
  id: campaign.id,
  title: campaign.title,
  description: campaign.description,
  destinationType: campaign.destination_type,
  destinationValue: campaign.destination_value,
  allocatedBudget: campaign.allocated_budget,
  budgetSpent: campaign.budget_spent,
  status: campaign.status,
  createdAt: campaign.created_at
});

module.exports = { createCampaign, getUserCampaigns };