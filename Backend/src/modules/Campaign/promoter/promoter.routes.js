const express = require("express");
const router = express.Router();

const {
  getActiveCampaignsHandler,
} = require("./promoter.controller");

const { requireAuth } = require("../../../middlewares/auth.Middleware");

/**
 * @openapi
 * /campaign/promoter/activecampaigns:
 *   get:
 *     tags:
 *       - Campaign - Promoter
 *     summary: Get active campaigns
 *     description: Returns campaigns currently available for promotion.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active campaigns fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/activecampaigns",
  requireAuth,
  getActiveCampaignsHandler
);

module.exports = router;