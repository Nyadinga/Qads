const { body, validationResult } = require("express-validator");

const validateRejectCampaign = [
  body("rejectionReason")
    .trim()
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isLength({ max: 1000 })
    .withMessage("Rejection reason must not exceed 1000 characters"),

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
  validateRejectCampaign,
};