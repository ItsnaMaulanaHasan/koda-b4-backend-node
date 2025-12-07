import jwt from "jsonwebtoken";
import process from "node:process";
import { hashPassword } from "../lib/hashPasswordArgon2.js";
import { getRedisClient } from "../lib/redis.js";
import {
  generateRandomToken,
  sendPasswordResetEmail,
} from "../lib/sendEmail.js";
import {
  deleteOldPasswordResetTokens,
  getUserIdByEmail,
  insertPasswordResetToken,
  updateUserPassword,
  verifyPasswordResetToken,
} from "../models/passwordReset.model.js";

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags:
 *       - authentication
 *     description: Send a 12-digit reset token to user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hasanmaulana453@gmail.com
 *     responses:
 *       200:
 *         description: Reset token sent successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Email not found
 *       500:
 *         description: Internal server error
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    let userId;
    try {
      userId = await getUserIdByEmail(email);
    } catch (err) {
      if (err.message === "Email not found") {
        res.status(404).json({
          success: false,
          message: "Email not found",
          error: err.message,
        });
        return;
      }
      throw err;
    }

    const token = generateRandomToken(12);

    await deleteOldPasswordResetTokens(userId);

    await insertPasswordResetToken(userId, token);

    await sendPasswordResetEmail(email, token);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
      data: {
        email: email,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send token via email",
      error: err.message,
    });
  }
}

/**
 * @openapi
 * /auth/reset-password:
 *   patch:
 *     summary: Reset password
 *     tags:
 *       - authentication
 *     description: Reset user password using valid token
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hasanmaulana453@gmail.com
 *               token:
 *                 type: string
 *                 example: Koda674wsUiq
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: Hasan@87654321
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
export async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email, token, and new password are required",
      });
      return;
    }

    let userId, expiredAt;
    try {
      const result = await verifyPasswordResetToken(email, token);
      userId = result.userId;
      expiredAt = result.expiredAt;
    } catch (err) {
      if (err.message === "Invalid token") {
        res.status(404).json({
          success: false,
          message: "Invalid token",
          error: err.message,
        });
        return;
      }
      throw err;
    }

    if (new Date() > new Date(expiredAt)) {
      await deleteOldPasswordResetTokens(userId);
      res.status(404).json({
        success: false,
        message: "Token has expired",
      });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    await updateUserPassword(userId, hashedPassword);

    await deleteOldPasswordResetTokens(userId);

    const redis = getRedisClient();

    const tokenUser = req.user?.token;
    if (tokenUser) {
      const payload = jwt.verify(tokenUser, process.env.APP_SECRET);

      const expiryTime = new Date(payload.exp * 1000);
      const now = new Date();
      const ttl = Math.floor((expiryTime - now) / 1000);

      if (ttl > 0) {
        const blacklistKey = `blacklist:${tokenUser}`;
        await redis.setEx(blacklistKey, ttl, tokenUser);
      }
    }

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed tp reset password",
      error: err.message,
    });
  }
}
