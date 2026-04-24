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

const findPendingCampaigns = async () => {
  return await Campaign.findAll({
    where: {
      status: "pending_approval",
    },
    include: [
      {
        model: CampaignCategory,
        as: "category",
        attributes: ["id", "name", "status", "min_cpc", "extra_platform_percentage"],
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
      {
        model: User,
        as: "campaignOwner",
        attributes: ["id", "first_name", "last_name", "username", "email", "phone"],
      },
    ],
    order: [
      ["submitted_at", "ASC"],
      [{ model: CampaignMedia, as: "media" }, "display_order", "ASC"],
    ],
  });
};

const approveCampaign = async (campaign, transaction) => {
  return await campaign.update(
    {
      status: "active",
      approved_at: new Date(),
      rejected_at: null,
      rejection_reason: null,
      paused_at: null,
      suspended_at: null,
      completed_at: null,
    },
    transaction ? { transaction } : undefined
  );
};

const rejectCampaign = async (campaign, rejectionReason, transaction) => {
  return await campaign.update(
    {
      status: "rejected",
      rejected_at: new Date(),
      rejection_reason: rejectionReason,
      approved_at: null,
    },
    transaction ? { transaction } : undefined
  );
};

const findCampaignsByOwnerId = async (ownerId, status = null) => {
  const where = {
    user_id: ownerId,
  };

  if (status) {
    where.status = status;
  }

  return await Campaign.findAll({
    where,
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

const pauseCampaign = async (campaign, transaction) => {
  return await campaign.update(
    {
      status: "paused",
      paused_at: new Date(),
    },
    transaction ? { transaction } : undefined
  );
};

const findCampaignDetailByOwnerId = async (campaignId, ownerId) => {
  return await Campaign.findOne({
    where: {
      id: campaignId,
      user_id: ownerId,
    },
    include: [
      {
        model: CampaignCategory,
        as: "category",
        attributes: [
          "id",
          "name",
          "status",
          "min_cpc",
          "extra_platform_percentage",
        ],
      },
      {
        model: CampaignMedia,
        as: "media",
        attributes: [
          "id",
          "media_type",
          "drive_file_id",
          "file_url",
          "preview_url",
          "file_name",
          "mime_type",
          "file_size_bytes",
          "display_order",
        ],
      },
    ],
    order: [[{ model: CampaignMedia, as: "media" }, "display_order", "ASC"]],
  });
};

const updateCampaign = async (campaign, payload, transaction) => {
  return await campaign.update(
    payload,
    transaction ? { transaction } : undefined
  );
};

const replaceCampaignMedia = async (campaignId, mediaRows, transaction) => {
  await CampaignMedia.destroy({
    where: { campaign_id: campaignId },
    ...(transaction ? { transaction } : {}),
  });

  if (!mediaRows?.length) {
    return [];
  }

  return await CampaignMedia.bulkCreate(
    mediaRows,
    transaction ? { transaction } : undefined
  );
};

const resumeCampaign = async (campaign, transaction) => {
  return await campaign.update(
    {
      status: "active",
      paused_at: null,
      updated_at: new Date(),
    },
    transaction ? { transaction } : undefined
  );
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
  findPendingCampaigns,
  approveCampaign,
  rejectCampaign,
  findCampaignsByOwnerId,
  pauseCampaign,
  findCampaignDetailByOwnerId,
  updateCampaign,
  replaceCampaignMedia,
};