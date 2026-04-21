const express = require("express");
const router = express.Router();

const {
  validateUser,
  validateLogin,
  validateVerifyOtp,
  validateResendOtp,
} = require("./auth.validator");

const {
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
  loginUser,
  verifyLoginOtp,
} = require("./auth.controller");

router.post("/register", validateUser, registerUser);
router.post("/register/verify-otp", validateVerifyOtp, verifyRegisterOtp);
router.post("/register/resend-otp", validateResendOtp, resendRegisterOtp);

router.post("/login", validateLogin, loginUser);
router.post("/login/verify-otp", validateVerifyOtp, verifyLoginOtp);

module.exports = router;