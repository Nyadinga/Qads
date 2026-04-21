const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/sequelize");

const UserSession = sequelize.define(
  "UserSession",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    refresh_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    device_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    device_type: {
      type: DataTypes.ENUM("mobile", "tablet", "desktop", "unknown"),
      allowNull: false,
      defaultValue: "unknown",
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    os: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_sessions",
    timestamps: false,
    indexes: [
      { fields: ["user_id"], name: "idx_user_sessions_user_id" },
      { fields: ["is_active"], name: "idx_user_sessions_is_active" },
      { fields: ["expires_at"], name: "idx_user_sessions_expires_at" },
    ],
  }
);

module.exports = UserSession;