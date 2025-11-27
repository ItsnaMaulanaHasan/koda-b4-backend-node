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
 * POST /auth/login
 * @summary Login user
 * @tags authentication
 * @description Authenticate user using email and password, then return JWT token
 * @consumes application/x-www-form-urlencoded
 * @param {string} email.form.required - Email of the user - application/x-www-form-urlencoded
 * @param {string} password.form.required - Password of the user - application/x-www-form-urlencoded
 * @return {object} 200 - Login successful
 * @return {object} 401 - Incorrect email or password
 * @return {object} 400 - Validation error
 * @return {object} 500 - Internal server error
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
      results: {
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message,
    });
    return;
  }
}

/**
 * POST /auth/register
 * @summary Register new user
 * @tags authentication
 * @description Create a new user account using full name, email, and password
 * @consumes application/x-www-form-urlencoded
 * @param {string} fullName.form.required - Full name of the user - application/x-www-form-urlencoded
 * @param {string} email.form.required - Email address of the user - application/x-www-form-urlencoded
 * @param {string} password.form.required - Password of the user - application/x-www-form-urlencoded
 * @param {string} role.form - Role of the user (default: customer) - application/x-www-form-urlencoded
 * @return {object} 201 - Register success
 * @return {object} 400 - Validation error
 * @return {object} 409 - Email already registered
 * @return {object} 500 - Internal server error
 *
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
      results: {
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
    return;
  }
}

// export async function logout(req, res) {}
