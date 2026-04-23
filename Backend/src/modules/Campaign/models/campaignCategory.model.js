const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/sequelize");

const CampaignCategory = sequelize.define(
  "CampaignCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM("known", "unknown"),
      allowNull: false,
      defaultValue: "known",
    },

    min_cpc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 50,
    },

    extra_platform_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "campaign_categories",
    timestamps: false,
    indexes: [
      { fields: ["status"], name: "idx_campaign_categories_status" },
      { fields: ["name"], name: "idx_campaign_categories_name" },
    ],
  }
);

module.exports = CampaignCategory;