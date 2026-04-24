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
  getAdvertiserCampaignDetailHandler,
  resumeCampaignHandler,
  updateAdvertiserCampaignHandler
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

/**
 * @openapi
 * /campaign/advertiser/pricing:
 *   post:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Preview campaign pricing
 *     description: Calculates a pricing preview before campaign creation.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - countryCode
 *               - unitPriceRange
 *               - destination
 *               - budget
 *               - advertiserCpc
 *             properties:
 *               countryCode:
 *                 type: string
 *                 example: CM
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               newCategoryName:
 *                 type: string
 *                 example: Medical Equipment
 *               unitPriceRange:
 *                 type: string
 *                 example: range_100001_500000
 *               destination:
 *                 type: string
 *                 enum: [external_url, whatsapp, qads_store, qads_product]
 *                 example: whatsapp
 *               budget:
 *                 type: number
 *                 example: 25000
 *               advertiserCpc:
 *                 type: number
 *                 example: 150
 *     responses:
 *       200:
 *         description: Campaign pricing preview generated successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
router.post(
  "/pricing",
  requireAuth,
  validatePreviewCampaignPricing,
  previewCampaignPricing
);

/**
 * @openapi
 * /campaign/advertiser/create:
 *   post:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Create campaign
 *     description: Creates a campaign for the authenticated advertiser.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - countryCode
 *               - productName
 *               - unitPriceRange
 *               - destination
 *               - budget
 *               - advertiserCpc
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [draft, launch]
 *                 example: launch
 *               title:
 *                 type: string
 *                 example: Wheelchair Campaign
 *               description:
 *                 type: string
 *                 example: Affordable mobility support equipment available in Yaounde.
 *               countryCode:
 *                 type: string
 *                 example: CM
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               newCategoryName:
 *                 type: string
 *                 example: Medical Equipment
 *               productName:
 *                 type: string
 *                 example: Wheelchair
 *               unitPriceRange:
 *                 type: string
 *                 example: range_100001_500000
 *               destination:
 *                 type: string
 *                 enum: [external_url, whatsapp, qads_store, qads_product]
 *                 example: whatsapp
 *               externalUrl:
 *                 type: string
 *                 example: https://example.com/product/12
 *               whatsappNumber:
 *                 type: string
 *                 example: "237670000111"
 *               qadsStoreId:
 *                 type: integer
 *                 example: 8
 *               qadsProductId:
 *                 type: integer
 *                 example: 45
 *               budget:
 *                 type: number
 *                 example: 25000
 *               advertiserCpc:
 *                 type: number
 *                 example: 150
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               mediaRefs:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
router.post(
  "/create",
  requireAuth,
  validateCreateCampaign,
  createCampaignHandler
);

/**
 * @openapi
 * /campaign/advertiser/upload:
 *   post:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Upload campaign media
 *     description: Uploads image or video files for campaign media.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Campaign media uploaded successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Upload or validation failed
 */
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

/**
 * @openapi
 * /campaign/advertiser/campaigns:
 *   get:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Get advertiser campaigns
 *     description: Returns campaigns owned by the authenticated advertiser.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Advertiser campaigns fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/campaigns",
  requireAuth,
  getAdvertiserCampaignsHandler
);

/**
 * @openapi
 * /campaign/advertiser/{id}:
 *   get:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Get single advertiser campaign
 *     description: Returns full details of one campaign owned by the authenticated advertiser.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Advertiser campaign details fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not allowed to access this campaign
 *       404:
 *         description: Campaign not found
 */
router.get(
  "/:id",
  requireAuth,
  requireCampaignOwner,
  getAdvertiserCampaignDetailHandler
);

/**
 * @openapi
 * /campaign/advertiser/{id}:
 *   patch:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Update advertiser campaign
 *     description: Updates a campaign owned by the authenticated advertiser.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               newCategoryName:
 *                 type: string
 *               productName:
 *                 type: string
 *               unitPriceRange:
 *                 type: string
 *               destination:
 *                 type: string
 *                 enum: [external_url, whatsapp, qads_store, qads_product]
 *               externalUrl:
 *                 type: string
 *               whatsappNumber:
 *                 type: string
 *               qadsStoreId:
 *                 type: integer
 *               qadsProductId:
 *                 type: integer
 *               budget:
 *                 type: number
 *               advertiserCpc:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               mediaRefs:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not allowed to update this campaign
 *       422:
 *         description: Validation failed
 */
router.patch(
  "/:id",
  requireAuth,
  requireCampaignOwner,
  validateUpdateAdvertiserCampaign,
  updateAdvertiserCampaignHandler
);

/**
 * @openapi
 * /campaign/advertiser/{id}/pause:
 *   post:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Pause campaign
 *     description: Pauses an active campaign owned by the authenticated advertiser.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Campaign paused successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not allowed or campaign is not active
 *       404:
 *         description: Campaign not found
 */
router.post(
  "/:id/pause",
  requireAuth,
  requireCampaignOwner,
  requireCampaignStatus("active"),
  pauseCampaignHandler
);

/**
 * @openapi
 * /campaign/advertiser/draft:
 *   post:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Save new draft campaign
 *     description: Saves an incomplete campaign as a draft.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               countryCode:
 *                 type: string
 *                 example: CM
 *               categoryId:
 *                 type: integer
 *               newCategoryName:
 *                 type: string
 *               productName:
 *                 type: string
 *               unitPriceRange:
 *                 type: string
 *               destination:
 *                 type: string
 *                 enum: [external_url, whatsapp, qads_store, qads_product]
 *               externalUrl:
 *                 type: string
 *               whatsappNumber:
 *                 type: string
 *               qadsStoreId:
 *                 type: integer
 *               qadsProductId:
 *                 type: integer
 *               budget:
 *                 type: number
 *               advertiserCpc:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               mediaRefs:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Campaign draft saved successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 */
router.post(
  "/draft",
  requireAuth,
  validateSaveDraftCampaign,
  saveNewDraftCampaignHandler
);

/**
 * @openapi
 * /campaign/advertiser/{id}/draft:
 *   patch:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Update draft campaign
 *     description: Updates an existing draft campaign owned by the authenticated advertiser.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 17
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               countryCode:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               newCategoryName:
 *                 type: string
 *               productName:
 *                 type: string
 *               unitPriceRange:
 *                 type: string
 *               destination:
 *                 type: string
 *                 enum: [external_url, whatsapp, qads_store, qads_product]
 *               externalUrl:
 *                 type: string
 *               whatsappNumber:
 *                 type: string
 *               qadsStoreId:
 *                 type: integer
 *               qadsProductId:
 *                 type: integer
 *               budget:
 *                 type: number
 *               advertiserCpc:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               mediaRefs:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Campaign draft updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not allowed to edit this draft
 *       422:
 *         description: Validation failed
 */
router.patch(
  "/:id/draft",
  requireAuth,
  requireCampaignOwner,
  validateSaveDraftCampaign,
  updateDraftCampaignHandler
);

/**
 * @openapi
 * /campaign/advertiser/{id}/resume:
 *   post:
 *     tags:
 *       - Campaign - Advertiser
 *     summary: Resume campaign
 *     description: Resumes a paused campaign owned by the authenticated advertiser.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Campaign resumed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not allowed or campaign is not paused
 *       404:
 *         description: Campaign not found
 */
router.post(
  "/:id/resume",
  requireAuth,
  requireCampaignOwner,
  requireCampaignStatus("paused"),
  resumeCampaignHandler
);

module.exports = router;