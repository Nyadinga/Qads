const express = require("express");
const { validateCampaignCreation, handleCampaignValidationErrors } = require("./campaign.Validator");
const { createNewCampaign, getMyCampaigns } = require("./campaignController");

const router = express.Router();

/**
 * @openapi
 * /campaign/create:
 * post:
 * tags:
 * - Campaign
 * summary: Create a new ad campaign
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * title:
 * type: string
 * destinationType:
 * type: string
 * example: whatsapp
 * allocatedBudget:
 * type: number
 * example: 50.00
 * responses:
 * 201:
 * description: Created successfully
 */
router.post(
  "/create",
  validateCampaignCreation,
  handleCampaignValidationErrors,
  createNewCampaign
);

router.get("/user/:userId", getMyCampaigns);

module.exports = router;