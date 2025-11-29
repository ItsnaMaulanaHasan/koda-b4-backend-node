import fs from "fs";
import { MulterError } from "multer";
import process from "node:process";
import path from "path";
import upload from "../lib/upload.js";
import {
  getDetailProfile,
  getProfilePhotoById,
  updateDataProfile,
  uploadProfilePhotoUser,
} from "../models/profiles.model.js";

/**
 * GET /profiles
 * @summary Get detail profile
 * @tags profiles
 * @description Retrieving detail profile based on Id in token
 * @security BearerAuth
 * @return {object} 200 - Successfully retrieved user
 * @return {object} 401 - User Id not found in token
 * @return {object} 404 - User not found
 * @return {object} 500 - Internal server error
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
 * PATCH /profiles
 * @summary Update profile
 * @tags profiles
 * @description Updating user profile based on Id from token
 * @security BearerAuth
 * @param {string} fullName.form - User fullname
 * @param {string} email.form - User email
 * @param {string} phone.form - User phone
 * @param {string} address.form - User address
 * @return {object} 200 - User updated successfully
 * @return {object} 400 - Invalid request body
 * @return {object} 401 - User Id not found in token
 * @return {object} 404 - User not found
 * @return {object} 500 - Internal server error
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
 * PATCH /profiles/photo
 * @summary Upload photo profile user
 * @tags profiles
 * @description Upload photo profile user data based on Id from token
 * @security BearerAuth
 * @param {file} profilePhoto.formData - Profile photo (JPEG/PNG, max 3MB)
 * @return {object} 200 - User updated successfully
 * @return {object} 400 - Invalid request body or file error
 * @return {object} 401 - User Id not found in token
 * @return {object} 404 - User not found
 * @return {object} 500 - Internal server error
 */
export async function uploadProfilePhoto(req, res) {
  upload.single("profilePhoto")(req, res, async function (err) {
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
        const fullPath = path.join(
          process.cwd(),
          "uploads/profiles",
          oldPhotoPath
        );
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

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
