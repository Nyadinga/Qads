const Campaign = require("./campaign.model");
const CampaignCategory = require("./campaignCategory.model");
const CampaignMedia = require("./campaignMedia.model");
const CampaignLink = require("./campaignLink.model");
const User = require("../../Authentication/models/user.model");

Campaign.belongsTo(CampaignCategory, {
  foreignKey: "category_id",
  as: "category",
});

CampaignCategory.hasMany(Campaign, {
  foreignKey: "category_id",
  as: "campaigns",
});

Campaign.hasMany(CampaignMedia, {
  foreignKey: "campaign_id",
  as: "media",
  onDelete: "CASCADE",
});

CampaignMedia.belongsTo(Campaign, {
  foreignKey: "campaign_id",
  as: "campaign",
});

Campaign.hasMany(CampaignLink, {
  foreignKey: "campaign_id",
  as: "links",
  onDelete: "CASCADE",
});

CampaignLink.belongsTo(Campaign, {
  foreignKey: "campaign_id",
  as: "campaign",
});

User.hasMany(Campaign, {
  foreignKey: "user_id",
  as: "ownedCampaigns",
  onDelete: "CASCADE",
});

Campaign.belongsTo(User, {
  foreignKey: "user_id",
  as: "owner",
});

User.hasMany(CampaignLink, {
  foreignKey: "promoter_id",
  as: "promotedCampaignLinks",
  onDelete: "CASCADE",
});

CampaignLink.belongsTo(User, {
  foreignKey: "promoter_id",
  as: "promoter",
});

module.exports = {
  Campaign,
  CampaignCategory,
  CampaignMedia,
  CampaignLink,
};