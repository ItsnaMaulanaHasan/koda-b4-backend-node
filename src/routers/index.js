import express, { Router } from "express";
import path from "node:path";
import process from "node:process";
import { adminOnly } from "../middlewares/adminOnly.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import authRouter from "./auth.route.js";
import productsRouter from "./products.admin.route.js";
import productsPublicRouter from "./products.public.route.js";
import profilesRouter from "./profiles.route.js";
import transactionsRouter from "./transactions.route.js";
import usersRouter from "./users.admin.route.js";

const router = Router();

// authentication
router.use("/auth", authRouter);

// admin
router.use("/admin/users", authMiddleware, adminOnly, usersRouter);
router.use("/admin/products", authMiddleware, adminOnly, productsRouter);
router.use(
  "/admin/transactions",
  authMiddleware,
  adminOnly,
  transactionsRouter
);

// public
router.use("", productsPublicRouter);
router.use("/profiles", authMiddleware, profilesRouter);

// serving static file
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default router;
