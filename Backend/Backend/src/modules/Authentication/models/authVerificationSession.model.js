const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/sequelize");

const AuthVerificationSession = sequelize.define(
  "AuthVerificationSession",
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM("register", "login", "reset_password"),
      allowNull: false,
    },
    otp_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    delivery_channel: {
      type: DataTypes.ENUM("whatsapp", "email"),
      allowNull: false,
    },
    target_value: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attempts: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
    },
    max_attempts: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 5,
    },
    status: {
      type: DataTypes.ENUM("pending", "verified", "expired", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "auth_verification_sessions",
    timestamps: false,
    indexes: [
      { fields: ["user_id", "purpose"], name: "idx_user_purpose" },
      { fields: ["status", "expires_at"], name: "idx_status_expires" },
    ],
  }
);

module.exports = AuthVerificationSession;