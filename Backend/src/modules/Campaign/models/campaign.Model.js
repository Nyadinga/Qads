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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    destination_type: {
      type: DataTypes.ENUM("external_url", "whatsapp", "qads_store", "qads_product"),
      allowNull: false,
    },
    destination_value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    allocated_budget: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    budget_spent: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    min_cpc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    advertiser_cpc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    effective_cpc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
      allowNull: false,
      defaultValue: "draft",
    },
    canonical_short_code: {
      type: DataTypes.STRING(120),
      allowNull: true,
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
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shop_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "campaigns",
    timestamps: false,
    indexes: [
      { fields: ["user_id"], name: "idx_campaign_user_id" },
      { fields: ["status"], name: "idx_campaign_status" },
      { fields: ["reviewed_by"], name: "idx_campaign_reviewed_by" },
    ],
  }
);

module.exports = Campaign;