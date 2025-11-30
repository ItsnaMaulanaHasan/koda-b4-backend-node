import fs from "fs";
import { MulterError } from "multer";
import { deleteFileIfExists, getUserFilePath } from "../lib/fileHelper.js";
import upload from "../lib/upload.js";
import { invalidateCache } from "../middlewares/caching.js";
import {
  getDetailProfile,
  getProfilePhotoById,
  updateDataProfile,
  uploadProfilePhotoUser,
} from "../models/profiles.model.js";

/**
 * @openapi
 * /profiles:
 *   get:
 *     summary: Get detail profile
 *     tags:
 *       - profiles
 *     description: Retrieving detail profile based on Id in JWT token
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *       401:
 *         description: User Id not found in token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function detailProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User Id not found in token",
      });
      return;
    }

    const user = await getDetailProfile(userId);

    res.status(200).json({
      success: true,
      message: "Success get data profile",
      data: user,
    });
  } catch (err) {
    const statusCode = err.message === "User not found" ? 404 : 500;
    const message =
      err.message === "User not found"
        ? "User not found"
        : "Internal server error while fetching profiles from database";

    res.status(statusCode).json({
      success: false,
      message: message,
      error: err.message,
    });
  }
}

/**
 * @openapi
 * /profiles:
 *   patch:
 *     summary: Update profile
 *     tags:
 *       - profiles
 *     description: Update profile data based on Id in token
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Daily Greens
 *               email:
 *                 type: string
 *                 example: greens@gmail.com
 *               phone:
 *                 type: string
 *                 example: 628123456789
 *               address:
 *                 type: string
 *                 example: Jl. Pancoran No. 123
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: User Id not found in token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User Id not found in token",
      });
      return;
    }

    const bodyUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
    };

    await updateDataProfile(userId, bodyUpdate);

    await invalidateCache("/profiles*");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (err) {
    const statusCode =
      err.message === "User not found" || err.message === "Profile not found"
        ? 404
        : 500;
    const message =
      err.message === "User not found" || err.message === "Profile not found"
        ? err.message
        : "Internal server error while updating user data";

    res.status(statusCode).json({
      success: false,
      message: message,
      error: err.message,
    });
  }
}

/**
 * @openapi
 * /profiles/photo:
 *   patch:
 *     summary: Upload photo profile user
 *     tags:
 *       - profiles
 *     description: Upload profile photo (JPEG/PNG, max 3MB)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - filePhoto
 *             properties:
 *               filePhoto:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo file (jpg/png)
 *     responses:
 *       200:
 *         description: Profile photo uploaded successfully
 *       400:
 *         description: File error or invalid request
 *       401:
 *         description: User Id not found in token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function uploadProfilePhoto(req, res) {
  upload.single("filePhoto")(req, res, async function (err) {
    const uploadedFile = req.file;
    try {
      if (err instanceof MulterError) {
        res.status(400).json({
          success: false,
          message: "Failed to upload profile photo",
          error: err.message,
        });
        return;
      } else if (err) {
        res.status(400).json({
          success: false,
          message: "Failed to upload profile photo",
          error: err.message,
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User Id not found in token",
        });
        return;
      }

      if (!uploadedFile) {
        res.status(400).json({
          success: false,
          message: "File is required",
        });
        return;
      }
      const oldPhotoPath = await getProfilePhotoById(userId);
      await uploadProfilePhotoUser(userId, uploadedFile.filename);

      if (oldPhotoPath) {
        const filePath = getUserFilePath(oldPhotoPath);
        deleteFileIfExists(filePath);
      }

      await invalidateCache("/profiles*");

      res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    } catch (err) {
      if (uploadedFile) {
        try {
          fs.unlinkSync(uploadedFile.path);
        } catch (unlinkErr) {
          console.error("Failed to delete file:", uploadedFile.path, unlinkErr);
        }
      }

      res.status(500).json({
        success: false,
        message: "Internal server error while upload profile photo",
        error: err.message,
      });
    }
  });
}
