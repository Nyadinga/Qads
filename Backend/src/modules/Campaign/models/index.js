const Campaign = require("./campaign.Model");
const User = require("../../Authentication/models/user.Model");
const CampaignMedia = require("./campaignMedia.Model");
const CampaignLink = require("./campaignLink.Model");

User.hasMany(Campaign, {
    foreignKey: 'user_id',
    as: 'campaigns'
});


Campaign.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'owner'
});

Campaign.belongsTo(User, {
     foreignKey: 'reviewed_by', 
     as: 'reviewer'
});

Campaign.hasMany(CampaignMedia, { 
    foreignKey: "campaign_id", 
    as: "media"
 });
CampaignMedia.belongsTo(Campaign, { 
    foreignKey: "campaign_id",
    as: "campaign"
 });

Campaign.hasMany(CampaignLink, { 
  foreignKey: 'campaign_id', 
  as: 'generated_links' 
});

CampaignLink.belongsTo(Campaign, { 
  foreignKey: 'campaign_id', 
  as: 'campaign' 
});

User.hasMany(CampaignLink, { 
  foreignKey: 'promoter_id', 
  as: 'my_promoter_links' 
});

CampaignLink.belongsTo(User, { 
  foreignKey: 'promoter_id', 
  as: 'promoter' 
});

Campaign.belongsToMany(User, {
  through: CampaignLink,
  foreignKey: 'campaign_id',
  otherKey: 'promoter_id',
  as: 'promoters' 
});

User.belongsToMany(Campaign, {
  through: CampaignLink,
  foreignKey: 'promoter_id',
  otherKey: 'campaign_id',
  as: 'promoted_campaigns' 
});


module.exports = {
  Campaign,
  User,
  CampaignMedia,
  CampaignLink
};