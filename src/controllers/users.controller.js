import { validationResult } from "express-validator";
import { MulterError } from "multer";
import process from "node:process";
import { deleteFileIfExists, getFilePathFromUrl } from "../lib/fileHelper.js";
import upload from "../lib/upload.js";
import {
  checkUserEmail,
  checkUserEmailExcludingId,
  createDataUser,
  deleteDataUser,
  getDetailUser,
  getListUsers,
  getTotalDataUsers,
  updateDataUser,
} from "../models/users.model.js";

/**
 * Create user request body
 * @typedef {object} CreateUserRequest
 * @property {string} filePhoto - User profile photo - binary
 * @property {string} fullName.required - Full name of user - eg: John Doe
 * @property {string} email.required - Email of user - eg: john@example.com
 * @property {string} password.required - Password (min 8 chars with uppercase, lowercase, number, special char) - eg: Password123!
 * @property {string} phone - Phone number of user - eg: +6281234567890
 * @property {string} address - Address of user - eg: Jl. Example No. 123
 * @property {string} role - Role of user - enum:customer,admin - eg: customer
 */

/**
 * Update user request body
 * @typedef {object} UpdateUserRequest
 * @property {string} filePhoto - User profile photo - binary
 * @property {string} fullName - Full name of user - eg: John Doe
 * @property {string} email - Email of user - eg: john@example.com
 * @property {string} phone - Phone number of user - eg: +6281234567890
 * @property {string} address - Address of user - eg: Jl. Example No. 123
 * @property {string} role - Role of user - enum:customer,admin - eg: customer
 */

/**
 * GET /admin/users
 * @summary Get list of all users
 * @tags admin/users
 * @description Retrieve paginated list of users with optional search filter
 * @security BearerAuth
 * @param {string} search.query - Search users by full name
 * @param {number} page.query - Current page number (default: 1)
 * @param {number} limit.query - Number of users per page (default: 10)
 * @return {object} 200 - Successfully retrieved list of users
 * @return {object} 500 - Failed to retrieve list of users
 */
export async function listUsers(req, res) {
  try {
    const { search = "" } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalData = await getTotalDataUsers(search);
    const listUsers = await getListUsers(search, page, limit);

    res.json({
      success: true,
      message: "Success get list users",
      result: {
        data: listUsers,
        meta: {
          page,
          limit,
          totalData,
          totalPage: Math.ceil(totalData / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get list users",
      error: err.message,
    });
    return;
  }
}

/**
 * GET /admin/users/{id}
 * @summary Get user detail by Id
 * @tags admin/users
 * @description Retrieve detail information of a user by their unique Id
 * @security BearerAuth
 * @param {number} id.path.required - Id of the user
 * @return {object} 200 - Success get detail of user
 * @return {object} 404 - User not found
 * @return {object} 500 - Internal server error
 */
export async function detailUser(req, res) {
  try {
    const { id } = req.params;
    const user = await getDetailUser(Number(id));

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Success get detail user",
      result: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to get detail user",
      error: err.message,
    });
  }
}

/**
 * POST /admin/users
 * @summary Create user
 * @tags admin/users
 * @description Create a new user with optional profile photo upload
 * @param {CreateUserRequest} request.body.required - User data - multipart/form-data
 * @security BearerAuth
 * @return {object} 201 - Create user success
 * @return {object} 400 - Validation error or upload error
 * @return {object} 409 - Email already registered
 * @return {object} 500 - Internal server error
 */
export async function createUser(req, res) {
  upload.single("filePhoto")(req, res, async function (err) {
    try {
      if (err instanceof MulterError) {
        res.status(400).json({
          success: false,
          message: "Failed to uploaf profile photo",
          error: err.message,
        });
        return;
      } else if (err) {
        res.status(400).json({
          success: false,
          message: "Failed to uploaf profile photo",
          error: err.message,
        });
        return;
      }

      const result = validationResult(req);
      if (!result.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Please provide valid data user",
          error: result.array(),
        });
        return;
      }

      let data = {
        profilePhoto: req.file?.filename || "",
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone || "",
        address: req.body.address || "",
        role: req.body.role || "customer",
      };

      const exists = await checkUserEmail(data.email);
      if (exists) {
        res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
        return;
      }

      const user = await createDataUser(data);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        result: {
          id: user.id,
          profilePhoto: user.profile.profilePhoto || "",
          fullName: user.profile.fullName,
          email: user.email,
          phone: user.profile.phoneNumber || "",
          address: user.profile.address || "",
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: err.message,
      });
    }
  });
}

/**
 * PATCH /admin/users/{id}
 * @summary Update user
 * @tags admin/users
 * @description Update user data with optional profile photo upload
 * @security BearerAuth
 * @param {number} id.path.required - Id of the user
 * @param {UpdateUserRequest} request.body.required - User data to update - multipart/form-data
 * @return {object} 200 - Update user success
 * @return {object} 400 - Validation error or upload error
 * @return {object} 404 - User not found
 * @return {object} 409 - Email already registered
 * @return {object} 500 - Internal server error
 */
export async function updateUser(req, res) {
  upload.single("filePhoto")(req, res, async function (err) {
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

      const result = validationResult(req);
      if (!result.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Please provide valid data user",
          error: result.array(),
        });
        return;
      }

      const userId = Number(req.params.id);

      const existingUser = await getDetailUser(userId);
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      let updateData = {};

      if (req.file?.filename)
        updateData.profilePhoto =
          process.env.BASE_UPLOAD_URL + req.file.filename;
      if (req.body.fullName) updateData.fullName = req.body.fullName;
      if (req.body.email) updateData.email = req.body.email;
      if (req.body.password) updateData.password = req.body.password;
      if (req.body.phone) updateData.phone = req.body.phone;
      if (req.body.address) updateData.address = req.body.address;
      if (req.body.role) updateData.role = req.body.role;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: "At least one field must be provided for update",
        });
        return;
      }

      if (updateData.email) {
        const emailExists = await checkUserEmailExcludingId(
          updateData.email,
          userId
        );
        if (emailExists) {
          res.status(409).json({
            success: false,
            message: "Email is already registered",
          });
          return;
        }
      }

      await updateDataUser(userId, updateData);

      res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: err.message,
      });
    }
  });
}

/**
 * DELETE /admin/users/{id}
 * @summary Delete user
 * @tags admin/users
 * @description Delete user permanently from the system
 * @security BearerAuth
 * @param {number} id.path.required - Id of the user
 * @return {object} 200 - Delete user success
 * @return {object} 404 - User not found
 * @return {object} 500 - Internal server error
 */
export async function deleteUser(req, res) {
  try {
    const userId = Number(req.params.id);

    const existingUser = await getDetailUser(userId);
    if (!existingUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    await deleteDataUser(userId);

    if (existingUser.profile?.profilePhoto) {
      const filePath = getFilePathFromUrl(
        existingUser.profile.profilePhoto,
        "profiles"
      );
      deleteFileIfExists(filePath);
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: err.message,
    });
  }
}
