const express = require("express");
const router = express.Router();

const {
  validateCreateCampaign,
  validatePreviewCampaignPricing,
} = require("./campaign.validator");

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

module.exports = router;