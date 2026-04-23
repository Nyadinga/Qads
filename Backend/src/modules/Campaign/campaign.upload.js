const multer = require("multer");

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_FILES = 5;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image/");
  const isVideo = file.mimetype.startsWith("video/");

  if (!isImage && !isVideo) {
    return cb(new Error("Only image and video files are allowed."));
  }

  cb(null, true);
};

const uploadCampaignMedia = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES,
  },
  fileFilter,
}).array("media", MAX_FILES);

module.exports = {
  uploadCampaignMedia,
};