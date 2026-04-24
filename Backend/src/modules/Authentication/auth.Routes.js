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

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account and sends an OTP for account verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - phone
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Fabien
 *               lastName:
 *                 type: string
 *                 example: Bright
 *               username:
 *                 type: string
 *                 example: fabien05
 *               email:
 *                 type: string
 *                 format: email
 *                 example: your-real-email@gmail.com
 *               phone:
 *                 type: string
 *                 example: "670000005"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone already taken
 */
router.post("/register", validateUser, registerUser);

/**
 * @openapi
 * /auth/register/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify registration OTP
 *     description: Verifies the OTP sent after registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationSessionId
 *               - otpCode
 *             properties:
 *               verificationSessionId:
 *                 type: string
 *                 format: uuid
 *                 example: 6fc0fbe0-95c5-45dd-a8d3-1d4ea6359f13
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid, expired, or cancelled OTP session
 *       404:
 *         description: Verification session not found
 */
router.post("/register/verify-otp", validateVerifyOtp, verifyRegisterOtp);

/**
 * @openapi
 * /auth/register/resend-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend registration OTP
 *     description: Resends the OTP for account verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationSessionId
 *             properties:
 *               verificationSessionId:
 *                 type: string
 *                 format: uuid
 *                 example: 6fc0fbe0-95c5-45dd-a8d3-1d4ea6359f13
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Unable to resend OTP
 *       404:
 *         description: Verification session not found
 */
router.post("/register/resend-otp", validateResendOtp, resendRegisterOtp);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticates a user with email or phone and sends an OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful, OTP sent
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account suspended or not verified
 */
router.post("/login", validateLogin, loginUser);

/**
 * @openapi
 * /auth/login/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify login OTP
 *     description: Verifies the OTP sent during login and returns session tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationSessionId
 *               - otpCode
 *             properties:
 *               verificationSessionId:
 *                 type: string
 *                 format: uuid
 *                 example: 6fc0fbe0-95c5-45dd-a8d3-1d4ea6359f13
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Verification session not found
 */
router.post("/login/verify-otp", validateVerifyOtp, verifyLoginOtp);

/**
 * @openapi
 * /auth/login/resend-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend login OTP
 *     description: Resends the OTP required for login verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationSessionId
 *             properties:
 *               verificationSessionId:
 *                 type: string
 *                 format: uuid
 *                 example: 6fc0fbe0-95c5-45dd-a8d3-1d4ea6359f13
 *     responses:
 *       200:
 *         description: Login OTP resent successfully
 *       400:
 *         description: Unable to resend OTP
 *       404:
 *         description: Verification session not found
 */
router.post("/login/resend-otp", validateResendOtp, resendLoginOtp);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Logs out the authenticated user by revoking the current session.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Session not found or already logged out
 */
router.post("/logout", requireAuth, logoutUser);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Forgot password
 *     description: Starts password reset by sending an OTP to the user email or phone flow.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 *       403:
 *         description: Account suspended
 *       404:
 *         description: No account found
 */
router.post("/forgot-password", validateForgotPassword, forgotPasswordUser);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: Resets the user password using a valid password reset verification session and OTP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationSessionId
 *               - otpCode
 *               - newPassword
 *             properties:
 *               verificationSessionId:
 *                 type: string
 *                 format: uuid
 *                 example: 6fc0fbe0-95c5-45dd-a8d3-1d4ea6359f13
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPass123!
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid input or expired OTP
 *       404:
 *         description: Verification session or user not found
 */
router.post("/reset-password", validateResetPassword, resetPasswordUser);

module.exports = router;