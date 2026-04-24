const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/sequelize");

const Campaign = sequelize.define(
  "Campaign",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    country_code: {
      type: DataTypes.STRING(2),
      allowNull: true,
      defaultValue: "CM",
    },

    currency_code: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: "XAF",
    },

    product_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    unit_price_range: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    destination: {
      type: DataTypes.ENUM(
        "external_url",
        "whatsapp",
        "qads_store",
        "qads_product"
      ),
      allowNull: true,
    },

    destination_source_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    destination_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    allocated_budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },

    budget_spent: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },

    min_cpc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    advertiser_cpc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    effective_cpc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    estimated_validated_click_capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    pricing_flags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    base_platform_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 30,
    },

    extra_platform_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
    },

    final_platform_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 30,
    },

    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "draft",
        "pending_approval",
        "active",
        "paused",
        "suspended",
        "rejected",
        "completed"
      ),
      allowNull: true,
      defaultValue: "draft",
    },

    canonical_short_code: {
      type: DataTypes.STRING(120),
      allowNull: true,
      unique: true,
    },

    canonical_short_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    paused_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    suspended_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "campaigns",
    timestamps: false,
    indexes: [
      { fields: ["user_id"], name: "idx_campaign_user_id" },
      { fields: ["category_id"], name: "idx_campaign_category_id" },
      { fields: ["status"], name: "idx_campaign_status" },
      { fields: ["country_code"], name: "idx_campaign_country_code" },
    ],
  }
);

module.exports = Campaign;