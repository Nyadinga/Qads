const { body, validationResult } = require("express-validator");

const UNIT_PRICE_RANGES = [
  "range_0_5000",
  "range_5001_20000",
  "range_20001_100000",
  "range_100001_500000",
  "range_500001_plus",
];

const DESTINATIONS = [
  "external_url",
  "whatsapp",
  "qads_store",
  "qads_product",
];

const validateSaveDraftCampaign = [
  body("title")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Campaign title must not exceed 255 characters"),

  body("description")
    .optional({ nullable: true })
    .trim(),

  body("countryCode")
    .optional({ nullable: true })
    .trim()
    .isIn(["CM"])
    .withMessage("Unsupported country"),

  body("categoryId")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Category id must be a valid integer"),

  body("newCategoryName")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("New category name must be between 2 and 150 characters"),

  body("productName")
    .optional({ nullable: true })
    .trim(),

  body("unitPriceRange")
    .optional({ nullable: true })
    .trim()
    .isIn(UNIT_PRICE_RANGES)
    .withMessage("Unsupported unit price range"),

  body("destination")
    .optional({ nullable: true })
    .trim()
    .isIn(DESTINATIONS)
    .withMessage("Unsupported destination"),

  body("externalUrl")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("External URL must be a valid URL"),

  body("whatsappNumber")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("WhatsApp number must be between 6 and 20 characters"),

  body("qadsStoreId")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("QADS store id must be a valid integer"),

  body("qadsProductId")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("QADS product id must be a valid integer"),

  body("budget")
    .optional({ nullable: true })
    .isFloat({ gt: 0 })
    .withMessage("Budget must be greater than 0"),

  body("advertiserCpc")
    .optional({ nullable: true })
    .isFloat({ gt: 0 })
    .withMessage("CPC must be greater than 0"),

  body("startDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  body("endDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),

  body("mediaRefs")
    .optional({ nullable: true })
    .isArray()
    .withMessage("mediaRefs must be an array"),

  body().custom((value, { req }) => {
    const {
      destination,
      externalUrl,
      whatsappNumber,
      qadsStoreId,
      qadsProductId,
    } = req.body;

    if (!destination) return true;

    if (destination === "external_url" && externalUrl === undefined) {
      throw new Error("External URL is required when destination is external_url");
    }

    if (destination === "whatsapp" && whatsappNumber === undefined) {
      throw new Error("WhatsApp number is required when destination is whatsapp");
    }

    if (destination === "qads_store" && qadsStoreId === undefined) {
      throw new Error("QADS store id is required when destination is qads_store");
    }

    if (destination === "qads_product" && qadsProductId === undefined) {
      throw new Error("QADS product id is required when destination is qads_product");
    }

    return true;
  }),

  body().custom((value, { req }) => {
    const { startDate, endDate } = req.body;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      throw new Error("End date must be after start date");
    }

    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((err) => ({
          field: err.path || "body",
          message: err.msg,
        })),
      });
    }

    next();
  },
];

module.exports = {
  validateSaveDraftCampaign,
};