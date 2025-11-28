import express, { Router } from "express";
import path from "node:path";
import process from "node:process";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import authRouter from "./auth.router.js";
import productsRouter from "./products.admin.route.js";
import usersRouter from "./users.admin.route.js";

const router = Router();

// authentication
router.use("/auth", authRouter);

// admin
router.use("/admin/users", authMiddleware, usersRouter);
router.use("/admin/products", authMiddleware, productsRouter);

// serving static file
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default router;
