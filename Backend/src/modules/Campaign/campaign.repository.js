const {
  Campaign,
  CampaignCategory,
  CampaignMedia,
} = require("./models");

const findCampaignCategoryById = async (id, transaction) => {
  return await CampaignCategory.findByPk(id, transaction ? { transaction } : {});
};

const findCampaignCategoryByName = async (name, transaction) => {
  return await CampaignCategory.findOne({
    where: { name },
    ...(transaction ? { transaction } : {}),
  });
};

const createCampaignCategory = async (payload, transaction) => {
  return await CampaignCategory.create(
    payload,
    transaction ? { transaction } : undefined
  );
};

const createCampaign = async (payload, transaction) => {
  return await Campaign.create(
    payload,
    transaction ? { transaction } : undefined
  );
};

const bulkCreateCampaignMedia = async (mediaRows, transaction) => {
  if (!mediaRows?.length) {
    return [];
  }

  return await CampaignMedia.bulkCreate(
    mediaRows,
    transaction ? { transaction } : undefined
  );
};

module.exports = {
  findCampaignCategoryById,
  findCampaignCategoryByName,
  createCampaignCategory,
  createCampaign,
  bulkCreateCampaignMedia,
};