const crypto = require("crypto");

const hashToken = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

module.exports = {
  hashToken,
};