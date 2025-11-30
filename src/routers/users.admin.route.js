import express from "express";
import {
  createUser,
  deleteUser,
  detailUser,
  listUsers,
  updateUser,
} from "../controllers/users.controller.js";
import { cache } from "../middlewares/caching.js";

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *       properties:
 *         filePhoto:
 *           type: string
 *           format: binary
 *         fullName:
 *           type: string
 *           example: Daily Greens
 *         email:
 *           type: string
 *           example: greens@example.com
 *         password:
 *           type: string
 *           example: Password@123
 *         phone:
 *           type: string
 *           example: 6281234567890
 *         address:
 *           type: string
 *           example: Jl. Pancoran No. 123
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           example: customer
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         filePhoto:
 *           type: string
 *           format: binary
 *         fullName:
 *           type: string
 *           example: Daily Greens
 *         email:
 *           type: string
 *           example: greens@example.com
 *         phone:
 *           type: string
 *           example: 6281234567890
 *         address:
 *           type: string
 *           example: Jl. Pancoran No. 123
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           example: customer
 */

const router = express();

router.get("", cache, listUsers);
router.get("/:id", cache, detailUser);
router.post("", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
