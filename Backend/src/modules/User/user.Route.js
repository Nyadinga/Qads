const express = require("express");
const {validateProfileUpdate, handleProfileValidationErrors,validatePasswordUpdate} = require("./user.Validator");
const { updateUserProfile, updatePassword, getUserProfile } = require("./user.Controller");

const router = express.Router();


router.put("/profile", 
    validateProfileUpdate,
    handleProfileValidationErrors, 
    updateUserProfile);
router.put(
  "/change-password",
  validatePasswordUpdate, 
  handleProfileValidationErrors,
  updatePassword
);
router.get(
  "/get-profile/:id",
  getUserProfile
);

module.exports = router;