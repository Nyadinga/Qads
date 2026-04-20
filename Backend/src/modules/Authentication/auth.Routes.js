const express = require("express");
const router = express.Router();

const {
  validateUser,
  validateVerifyOtp,
  validateResendOtp,
} = require("./auth.validator");

const {
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
} = require("./auth.controller");

router.post("/register", validateUser, registerUser);
router.post("/register/verify-otp", validateVerifyOtp, verifyRegisterOtp);
router.post("/register/resend-otp", validateResendOtp, resendRegisterOtp);

module.exports = router;