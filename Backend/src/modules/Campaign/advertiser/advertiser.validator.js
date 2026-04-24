const { body, validationResult } = require("express-validator");

const COUNTRIES = ["CM"];

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

const createCampaignValidationRules = [
  body("title").trim().notEmpty().withMessage("Campaign title is required"),
  body("description").trim().notEmpty().withMessage("Campaign description is required"),
  body("countryCode").trim().notEmpty().isIn(COUNTRIES).withMessage("Unsupported country"),
  body("productName").trim().notEmpty().withMessage("Product name is required"),
  body("unitPriceRange").trim().notEmpty().isIn(UNIT_PRICE_RANGES),
  body("destination").trim().notEmpty().isIn(DESTINATIONS),
  body("budget").notEmpty().isFloat({ gt: 0 }).withMessage("Budget must be > 0"),
  body("advertiserCpc").notEmpty().isFloat({ gt: 0 }).withMessage("CPC must be > 0"),
];

const previewPricingValidationRules = [
  body("countryCode").trim().notEmpty().isIn(COUNTRIES),
  body("unitPriceRange").trim().notEmpty().isIn(UNIT_PRICE_RANGES),
  body("destination").trim().notEmpty().isIn(DESTINATIONS),
  body("budget").notEmpty().isFloat({ gt: 0 }),
  body("advertiserCpc").notEmpty().isFloat({ gt: 0 }),
];

const handleCampaignValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateCreateCampaign = [...createCampaignValidationRules, handleCampaignValidationErrors];
const validatePreviewCampaignPricing = [...previewPricingValidationRules, handleCampaignValidationErrors];

module.exports = {
  validateCreateCampaign,
  validatePreviewCampaignPricing,
};