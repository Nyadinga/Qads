const express = require("express");
const router = express.Router();
const { uploadCampaignMedia } = require("./campaign.upload");

const {
  validateCreateCampaign,
  validatePreviewCampaignPricing,
  validateUpdateAdvertiserCampaign,
} = require("./advertiser.validator");

const {
  previewCampaignPricing,
  createCampaignHandler,
  uploadCampaignMediaHandler,
  getAdvertiserCampaignsHandler,
  pauseCampaignHandler,
  updateAdvertiserCampaignHandler,
  getAdvertiserCampaignDetailHandler
} = require("./advertiser.controller");

const {
  requireCampaignOwner,
  requireCampaignStatus,
} = require("../campaign.policies");


const { requireAuth } = require("../../../middlewares/auth.Middleware");



router.post(
  "/pricing",
  requireAuth,
  validatePreviewCampaignPricing, 
  previewCampaignPricing
);


router.post(
  "/create",requireAuth,
  validateCreateCampaign,
  createCampaignHandler
);


router.post(
  "/upload",
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

router.post(
  "/:id/pause",
  requireAuth,
  requireCampaignOwner,
  requireCampaignStatus("active"),
  pauseCampaignHandler
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
  updateAdvertiserCampaignHandler
);

module.exports = router;