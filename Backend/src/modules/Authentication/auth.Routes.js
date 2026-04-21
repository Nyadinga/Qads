const express = require("express");
const router = express.Router();

const {
  validateUser,
  validateLogin,
  validateVerifyOtp,
  validateResendOtp,
  validateForgotPassword,
  validateResetPassword,
} = require("./auth.validator");

const {
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
  logoutUser,
  forgotPasswordUser,
  resetPasswordUser,
} = require("./auth.controller");

const { requireAuth } = require("../../middlewares/auth.Middleware");
///register routes
router.post("/register", validateUser, registerUser);
router.post("/register/verify-otp", validateVerifyOtp, verifyRegisterOtp);
router.post("/register/resend-otp", validateResendOtp, resendRegisterOtp);
///login routes
router.post("/login", validateLogin, loginUser);
router.post("/login/verify-otp", validateVerifyOtp, verifyLoginOtp);
router.post("/login/resend-otp", validateResendOtp, resendLoginOtp);
///logout routes
router.post("/logout", requireAuth, logoutUser);
///password related routes
router.post("/forgot-password", validateForgotPassword, forgotPasswordUser);
router.post("/reset-password", validateResetPassword, resetPasswordUser);

module.exports = router;