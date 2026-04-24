const {
  Campaign
} = require("./models");

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

module.exports = {
  findActiveCampaigns,
};