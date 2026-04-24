const express = require("express");
const router = express.Router();
const { uploadCampaignMedia } = require("./campaign.upload");

const {
  validateCreateCampaign,
  validatePreviewCampaignPricing,
  validateUpdateAdvertiserCampaign,
} = require("./advertiser.validator");

const {
  validateSaveDraftCampaign,
} = require("./advertiserDraft.validator");

const {
  previewCampaignPricing,
  createCampaignHandler,
  uploadCampaignMediaHandler,
  getAdvertiserCampaignsHandler,
  pauseCampaignHandler,
  updateAdvertiserCampaignHandler,
  getAdvertiserCampaignDetailHandler,
} = require("./advertiser.controller");

const {
  updateDraftCampaignHandler,
  saveNewDraftCampaignHandler,
} = require("./advertiserDraft.controller");

const {
  requireCampaignOwner,
  requireCampaignStatus,
} = require("../campaign.policies");

const { requireAuth } = require("../../../middlewares/auth.Middleware");



router.post(
  "/campaigns/pricing",
  requireAuth,
  validatePreviewCampaignPricing,
  previewCampaignPricing
);

router.post(
  "/campaigns/create",
  requireAuth,
  validateCreateCampaign,
  createCampaignHandler
);

router.post(
  "/campaigns/upload",
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

router.get(
  "/campaigns",
  requireAuth,
  getAdvertiserCampaignsHandler
);

router.get(
  "/campaigns/:id",
  requireAuth,
  requireCampaignOwner,
  getAdvertiserCampaignDetailHandler
);

router.patch(
  "/campaigns/:id",
  requireAuth,
  requireCampaignOwner,
  validateUpdateAdvertiserCampaign,
);

router.post(
  "/campaigns/:id/pause",
  requireAuth,
  requireCampaignOwner,
  requireCampaignStatus("active"),
  pauseCampaignHandler
);

router.post(
  "/campaigns/draft",
  requireAuth,
  validateSaveDraftCampaign,
  saveNewDraftCampaignHandler
);

router.patch(
  "/campaigns/:id/draft",
  requireAuth,
  requireCampaignOwner,
  validateSaveDraftCampaign,
  updateDraftCampaignHandler
);

module.exports = router;