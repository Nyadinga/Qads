const express = require("express");
const router = express.Router();
const { uploadCampaignMedia } = require("./campaign.upload");

const {
  validateCreateCampaign,
  validatePreviewCampaignPricing,
} = require("./advertiser.validator");

const {
  previewCampaignPricing,
  createCampaignHandler,
  uploadCampaignMediaHandler,
} = require("./advertiser.controller");




const { requireAuth } = require("../../../middlewares/auth.Middleware");





console.log("DEBUGGING ROUTE HANDLERS:");
console.log("1. requireAuth is:", typeof requireAuth);
console.log("2. validateRules is:", typeof validatePreviewCampaignPricing);
console.log("3. controllerFunction is:", typeof previewCampaignPricing);

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


module.exports = router;