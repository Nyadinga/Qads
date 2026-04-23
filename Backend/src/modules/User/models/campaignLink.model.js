const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/sequelize");

const CampaignLink = sequelize.define(
  "CampaignLink",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promoter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tracking_code: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    share_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "unavailable", "disabled"),
      allowNull: false,
      defaultValue: "active",
    },
    total_validated_clicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_unique_clicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "campaign_links",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["campaign_id", "promoter_id"],
        name: "uniq_campaign_promoter",
      },
      {
        fields: ["campaign_id"],
        name: "idx_campaign_links_campaign_id",
      },
      {
        fields: ["promoter_id"],
        name: "idx_campaign_links_promoter_id",
      },
      {
        fields: ["status"],
        name: "idx_campaign_links_status",
      },
    ],
  }
);

module.exports = CampaignLink;