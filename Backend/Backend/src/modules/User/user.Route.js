const express = require("express");
const {
  validateProfileUpdate,
  handleProfileValidationErrors,
  validatePasswordUpdate,
} = require("./user.Validator");
const {
  updateUserProfile,
  updatePassword,
  getUserProfile,
} = require("./user.Controller");

const router = express.Router();

/**
 * @openapi
 * /user/profile:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user profile
 *     description: Updates the profile information of a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *                 example: fabien@example.com
 *               phone:
 *                 type: string
 *                 example: "670000005"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put(
  "/profile",
  validateProfileUpdate,
  handleProfileValidationErrors,
  updateUserProfile
);

/**
 * @openapi
 * /user/change-password:
 *   put:
 *     tags:
 *       - User
 *     summary: Change user password
 *     description: Updates the password of a user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPass123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPass123!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized or invalid current password
 */
router.put(
  "/change-password",
  validatePasswordUpdate,
  handleProfileValidationErrors,
  updatePassword
);

/**
 * @openapi
 * /user/get-profile/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user profile
 *     description: Retrieves a user profile by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *         example: 1
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/get-profile/:id", getUserProfile);

module.exports = router;