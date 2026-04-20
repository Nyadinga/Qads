const express = require("express");
const router = express.Router();

const { validateUser, validateVerifyOtp } = require("./auth.validator");
const { registerUser, verifyRegisterOtp } = require("./auth.controller");

router.post("/register", validateUser, registerUser);
router.post("/register/verify-otp", validateVerifyOtp, verifyRegisterOtp);

module.exports = router;