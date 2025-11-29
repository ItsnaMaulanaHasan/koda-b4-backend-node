import { validationResult } from "express-validator";
import { MulterError } from "multer";
import process from "node:process";
import { deleteFileIfExists, getUserFilePath } from "../lib/fileHelper.js";
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
 * @openapi
 * /admin/users:
 *   get:
 *     summary: Get list of all users
 *     tags:
 *       - admin/users
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve paginated list of users with optional search filter
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search users by full name
 *         required: false
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved list of users
 *       500:
 *         description: Failed to retrieve list users
 */
export async function listUsers(req, res) {
  try {
    const { search = "" } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'page' must be greater than 0",
      });
      return;
    }

    if (limit < 1) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' must be greater than 0",
      });
      return;
    }

    if (limit > 100) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameter: 'limit' cannot exceed 100",
      });
      return;
    }

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
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     summary: Get user detail by Id
 *     tags:
 *       - admin/users
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve detail information of a user by their unique Id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success get detail of user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
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
 * @openapi
 * /admin/users:
 *   post:
 *     summary: Create user
 *     tags:
 *       - admin/users
 *     security:
 *       - BearerAuth: []
 *     description: Create a new user with optional profile photo upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or upload error
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
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
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     summary: Update user
 *     tags:
 *       - admin/users
 *     security:
 *       - BearerAuth: []
 *     description: Update user data with optional profile photo upload
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error or upload error
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
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
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags:
 *       - admin/users
 *     security:
 *       - BearerAuth: []
 *     description: Delete user permanently from the system
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
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
      const filePath = getUserFilePath(existingUser.profile.profilePhoto);
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
