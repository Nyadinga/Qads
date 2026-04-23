const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/sequelize");

const CampaignMedia = sequelize.define(
  "CampaignMedia",
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
    media_type: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: false,
    },
    drive_file_id: {
      type: DataTypes.STRING(255),
      allowNull: false, 
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false, 
    },
    preview_url: {
      type: DataTypes.TEXT,
      allowNull: true, 
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    file_size_bytes: {
      type: DataTypes.BIGINT, 
      allowNull: false,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "campaign_media",
    timestamps: false, 
    indexes: [
      { fields: ["campaign_id"], name: "idx_campaign_media_campaign_id" },
    ],
  }
);

module.exports = CampaignMedia;