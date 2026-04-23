const path = require("path");
const { Readable } = require("stream");
const { driveClient, GOOGLE_DRIVE_FOLDER_ID } = require("../../../config/googleDrive");

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const getMediaTypeFromMime = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return null;
};

const assertValidCampaignMedia = (file) => {
  if (!file) {
    const error = new Error("No file was provided.");
    error.statusCode = 400;
    throw error;
  }

  const mediaType = getMediaTypeFromMime(file.mimetype);
  if (!mediaType) {
    const error = new Error("Only image and video files are allowed.");
    error.statusCode = 422;
    throw error;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const error = new Error("Each media file must be 20MB or less.");
    error.statusCode = 422;
    throw error;
  }

  return mediaType;
};

const buildDriveViewUrl = (fileId) =>
  `https://drive.google.com/file/d/${fileId}/view`;

const buildDrivePreviewUrl = (fileId) =>
  `https://drive.google.com/thumbnail?id=${fileId}`;

const uploadSingleCampaignMediaToDrive = async (file) => {
  const mediaType = assertValidCampaignMedia(file);

  const ext = path.extname(file.originalname || "");
  const safeName = ext ? file.originalname : `${file.originalname}${ext}`;

  const response = await driveClient.files.create({
    requestBody: {
      name: safeName,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    },
    fields: "id,name,mimeType,size,parents",
    supportsAllDrives: true,
  });

  const uploaded = response.data;

  return {
    mediaType,
    driveFileId: uploaded.id,
    fileUrl: buildDriveViewUrl(uploaded.id),
    previewUrl: mediaType === "image" ? buildDrivePreviewUrl(uploaded.id) : null,
    fileName: uploaded.name,
    mimeType: uploaded.mimeType || file.mimetype,
    fileSizeBytes: Number(uploaded.size || file.size),
  };
};

const uploadMultipleCampaignMediaToDrive = async (files = []) => {
  const results = [];

  for (let index = 0; index < files.length; index += 1) {
    const uploaded = await uploadSingleCampaignMediaToDrive(files[index]);
    results.push({
      ...uploaded,
      displayOrder: index,
    });
  }

  return results;
};

module.exports = {
  uploadSingleCampaignMediaToDrive,
  uploadMultipleCampaignMediaToDrive,
};