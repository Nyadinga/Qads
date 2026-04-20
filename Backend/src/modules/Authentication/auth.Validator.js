const { body, validationResult } = require("express-validator");

const registerValidationRules = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email must be a valid format")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const verifyOtpValidationRules = [
  body("verificationSessionId")
    .trim()
    .notEmpty()
    .withMessage("Verification session ID is required")
    .bail()
    .isUUID()
    .withMessage("Verification session ID must be a valid UUID"),

  body("otpCode")
    .trim()
    .notEmpty()
    .withMessage("OTP code is required")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits")
    .matches(/^\d{6}$/)
    .withMessage("OTP code must contain only digits"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

const validateUser = [...registerValidationRules, handleValidationErrors];
const validateVerifyOtp = [...verifyOtpValidationRules, handleValidationErrors];

module.exports = {
  validateUser,
  validateVerifyOtp,
};