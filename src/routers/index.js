import express, { Router } from "express";
import path from "node:path";
import process from "node:process";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import authRouter from "./auth.router.js";
import usersRouter from "./users.admin.route.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/admin/users", authMiddleware, usersRouter);
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default router;
