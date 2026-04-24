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


const findActiveCampaigns = async () => {
  return await Campaign.findAll({
    where: {
      status: "active",
    },
    include: [
      {
        model: CampaignCategory,
        as: "category",
        attributes: ["id", "name", "status"],
      },
      {
        model: CampaignMedia,
        as: "media",
        attributes: [
          "id",
          "media_type",
          "file_url",
          "preview_url",
          "file_name",
          "mime_type",
          "file_size_bytes",
          "display_order",
        ],
      },
    ],
    order: [
      ["created_at", "DESC"],
      [{ model: CampaignMedia, as: "media" }, "display_order", "ASC"],
    ],
  });
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



const findCampaignById = async (campaignId) => {
  return await Campaign.findByPk(campaignId, {
    include: [
      {
        model: CampaignCategory,
        as: "category",
      },
      {
        model: CampaignMedia,
        as: "media",
      },
    ],
  });
};

const findCampaignByIdAndOwnerId = async (campaignId, ownerId) => {
  return await Campaign.findOne({
    where: {
      id: campaignId,
      user_id: ownerId,
    },
    include: [
      {
        model: CampaignCategory,
        as: "category",
      },
      {
        model: CampaignMedia,
        as: "media",
      },
    ],
  });
};

const findActiveCampaignById = async (campaignId) => {
  return await Campaign.findOne({
    where: {
      id: campaignId,
      status: "active",
    },
    include: [
      {
        model: CampaignCategory,
        as: "category",
      },
      {
        model: CampaignMedia,
        as: "media",
      },
    ],
  });
};

module.exports = {
  findCampaignCategoryById,
  findCampaignCategoryByName,
  createCampaignCategory,
  createCampaign,
  bulkCreateCampaignMedia,
  findCampaignById,
  findCampaignByIdAndOwnerId,
  findActiveCampaignById,
  findActiveCampaigns,
};