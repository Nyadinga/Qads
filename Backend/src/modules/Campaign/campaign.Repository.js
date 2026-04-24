const Campaign = require("./models/campaign.Model");

const findCampaignById = async (id) => {
  return await Campaign.findByPk(id);
};

const createCampaign = async (campaignData) => {
  return await Campaign.create(campaignData);
};

const updateCampaign = async (campaignInstance, updateData) => {
  return await campaignInstance.update(updateData);
};

const findCampaignsByUserId = async (userId) => {
  return await Campaign.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
};

module.exports = {
  findCampaignById,
  createCampaign,
  updateCampaign,
  findCampaignsByUserId
};