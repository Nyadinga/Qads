const User = require("./user.model");
const AuthVerificationSession = require("./authVerificationSession.model");
const UserSession = require("./userSessions.model");

User.hasMany(AuthVerificationSession, {
  foreignKey: "user_id",
  as: "verificationSessions",
  onDelete: "CASCADE",
});

AuthVerificationSession.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

User.hasMany(UserSession, {
  foreignKey: "user_id",
  as: "sessions",
  onDelete: "CASCADE",
});

UserSession.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = {
  User,
  AuthVerificationSession,
  UserSession,
};