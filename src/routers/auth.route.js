import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: Password@123
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - password
 *       properties:
 *         fullName:
 *           type: string
 *           example: Daily Greens
 *         email:
 *           type: string
 *           example: greens@example.com
 *         password:
 *           type: string
 *           example: Password@123
 *         role:
 *           type: string
 *           enum: [customer, admin]
 *           example: customer
 */

const router = express();

router.post("/login", loginSchema, login);
router.post("/register", registerSchema, register);
router.post("/logout", logout);

export default router;
