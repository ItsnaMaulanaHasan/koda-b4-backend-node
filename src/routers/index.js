import express, { Router } from "express";
import path from "node:path";
import process from "node:process";
import { adminOnly } from "../middlewares/adminOnly.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import authRouter from "./auth.route.js";
import cartsRouter from "./carts.route.js";
import checkoutRouter from "./checkout.route.js";
import historiesRouter from "./histories.route.js";
import orderMethodRouter from "./orderMethod.route.js";
import paymentMethodRouter from "./paymentMethod.route.js";
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
router.use("/histories", authMiddleware, historiesRouter);
router.use("/carts", authMiddleware, cartsRouter);
router.use("/transactions", authMiddleware, checkoutRouter);
router.use("/order-methods", authMiddleware, orderMethodRouter);
router.use("/payment-methods", authMiddleware, paymentMethodRouter);

// serving static file
router.use(
  "/uploads/products",
  express.static(path.join(process.cwd(), "uploads/products"))
);

router.use(
  "/uploads/profiles",
  express.static(path.join(process.cwd(), "uploads/profiles"))
);

export default router;
