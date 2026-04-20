const User = require("./user.model");
const AuthVerificationSession = require("./authVerificationSession.model");

User.hasMany(AuthVerificationSession, {
  foreignKey: "user_id",
  as: "verificationSessions",
  onDelete: "CASCADE",
});

AuthVerificationSession.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = {
  User,
  AuthVerificationSession,
};