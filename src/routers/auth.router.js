import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = express();

router.post("/auth/login", loginSchema, login);
router.post("/auth/register", registerSchema, register);

export default router;
