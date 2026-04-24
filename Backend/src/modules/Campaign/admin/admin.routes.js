const express = require("express");
const router = express.Router();

const { requireAuth } = require("../../../middlewares/auth.Middleware");
const { requireAdmin } = require("../campaign.policies");
const { getPendingCampaignsHandler,approveCampaignHandler,rejectCampaignHandler } = require("./admin.controller");
const { validateRejectCampaign } = require("./admin.validator");

const {
  loadCampaignById,
  requireCampaignStatus,
} = require("../campaign.policies");

router.get(
  "/pending",
  requireAuth,
  requireAdmin,
  getPendingCampaignsHandler
);

router.post(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  loadCampaignById,
  requireCampaignStatus("pending_approval"),
  approveCampaignHandler
);

router.post(
  "/:id/reject",
  requireAuth,
  requireAdmin,
  loadCampaignById,
  requireCampaignStatus("pending_approval"),
  validateRejectCampaign,
  rejectCampaignHandler
);


module.exports = router;    