import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = express();

router.post("/login", loginSchema, login);
router.post("/register", registerSchema, register);
// router.post("/logout", logout);

export default router;
