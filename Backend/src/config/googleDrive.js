const { drive } = require("@googleapis/drive");
const { JWT } = require("google-auth-library");

const requiredEnv = [
  "GOOGLE_DRIVE_CLIENT_EMAIL",
  "GOOGLE_DRIVE_PRIVATE_KEY",
  "GOOGLE_DRIVE_FOLDER_ID",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} is required for Google Drive uploads.`);
  }
}

const auth = new JWT({
  email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
  key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const driveClient = drive({
  version: "v3",
  auth,
});

module.exports = {
  driveClient,
  GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
};