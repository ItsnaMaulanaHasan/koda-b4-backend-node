import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import process from "node:process";
import { verifyPassword } from "../lib/hashPasswordArgon2.js";
import {
  checkUserEmail,
  getUserByEmail,
  registerUser,
} from "../models/users.model.js";

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

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - authentication
 *     description: Login user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 */
export async function login(req, res) {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Please provide valid email and password",
        error: result.array(),
      });
      return;
    }

    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
      return;
    }

    const isValidPassword = await verifyPassword(user.password, password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.APP_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.json({
      success: true,
      message: "Login successfull!",
      result: {
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message,
    });
  }
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags:
 *       - authentication
 *     description: Register user with fullname, email, role, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 */
export async function register(req, res) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Please provide valid registration information",
        error: result.array(),
      });
      return;
    }

    let data = req.body;

    const exists = await checkUserEmail(data.email);
    if (exists) {
      res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
      return;
    }

    const user = await registerUser(data);

    res.json({
      success: true,
      message: "User registered successfully",
      result: {
        id: user.id,
        fullName: user.profile.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Register failed",
      error: err.message,
    });
  }
}

// export async function logout(req, res) {}
