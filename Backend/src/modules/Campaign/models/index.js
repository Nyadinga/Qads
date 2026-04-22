const Campaign = require("./campaign.Model");
const User = require("../../Authentication/models/user.Model");
const CampaignMedia = require("./campaignMedia.Model");

User.hasMany(Campaign, {
    foreignKey: 'user_id',
    as: 'campaigns' });


Campaign.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'owner' });

Campaign.belongsTo(User, {
     foreignKey: 'reviewed_by', 
     as: 'reviewer' });

Campaign.hasMany(CampaignMedia, { 
    foreignKey: "campaign_id", 
    as: "media"
 });
CampaignMedia.belongsTo(Campaign, { 
    foreignKey: "campaign_id",
    as: "campaign"
 });


module.exports = {
  Campaign,
  User,
  CampaignMedia
};