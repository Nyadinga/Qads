const express = require("express");
const router = express.Router();

const { requireAuth } = require("../../../middlewares/auth.Middleware");
const { requireAdmin, loadCampaignById, requireCampaignStatus } = require("../campaign.policies");
const {
  getPendingCampaignsHandler,
  approveCampaignHandler,
  rejectCampaignHandler,
} = require("./admin.controller");
const { validateRejectCampaign } = require("./admin.validator");

/**
 * @openapi
 * /campaign/admin/pending:
 *   get:
 *     tags:
 *       - Campaign - Admin
 *     summary: Get pending campaigns
 *     description: Returns all campaigns currently waiting for admin review.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending campaigns fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
  "/pending",
  requireAuth,
  requireAdmin,
  getPendingCampaignsHandler
);

/**
 * @openapi
 * /campaign/admin/{id}/approve:
 *   post:
 *     tags:
 *       - Campaign - Admin
 *     summary: Approve a campaign
 *     description: Approves a campaign that is currently in pending approval state.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required or campaign is not in pending approval state
 *       404:
 *         description: Campaign not found
 */
router.post(
  "/:id/approve",
  requireAuth,
  requireAdmin,
  loadCampaignById,
  requireCampaignStatus("pending_approval"),
  approveCampaignHandler
);

/**
 * @openapi
 * /campaign/admin/{id}/reject:
 *   post:
 *     tags:
 *       - Campaign - Admin
 *     summary: Reject a campaign
 *     description: Rejects a campaign that is currently in pending approval state.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 example: Campaign media violates platform advertising rules.
 *     responses:
 *       200:
 *         description: Campaign rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required or campaign is not in pending approval state
 *       404:
 *         description: Campaign not found
 *       422:
 *         description: Validation failed
 */
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