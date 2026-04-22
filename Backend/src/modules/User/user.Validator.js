const { body, validationResult } = require('express-validator');


const validateProfileUpdate = [
  body('email')
    .optional() 
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(), 

  body('first_name')
    .optional()
    .trim()
    .notEmpty(),
    

  body('last_name')
    .optional()
    .trim()
    .notEmpty(),
   

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    
];

const validatePasswordUpdate = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password')
    .custom((value, { req }) => {

      if (value !== req.body.newPassword) {
        throw new Error('New password and confirm password do not match');
      }
      return true; 
    })
];

  const handleProfileValidationErrors = (req, res, next) => {
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


module.exports = { validateProfileUpdate,validatePasswordUpdate, handleProfileValidationErrors };