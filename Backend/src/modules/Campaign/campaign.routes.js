const express = require("express");
const router = express.Router();
const { uploadCampaignMedia } = require("./campaign.upload");

const {
  validateCreateCampaign,
  validatePreviewCampaignPricing,
} = require("./campaign.validator");

const {
  uploadCampaignMediaHandler,
} = require("./campaign.upload.controller");

const {
  previewCampaignPricing,
  createCampaignHandler,
} = require("./campaign.controller");

const { requireAuth } = require("../../middlewares/auth.Middleware");

router.post(
  "/campaigns/pricing/preview",
  requireAuth,
  validatePreviewCampaignPricing,
  previewCampaignPricing
);

router.post(
  "/createcampaigns",requireAuth,
  validateCreateCampaign,
  createCampaignHandler
);

router.post(
  "/campaigns/media/upload",
  requireAuth,
  (req, res, next) => {
    uploadCampaignMedia(req, res, (err) => {
      if (err) {
        err.statusCode = err.statusCode || 422;
        return next(err);
      }
      next();
    });
  },
  uploadCampaignMediaHandler
);

module.exports = router;