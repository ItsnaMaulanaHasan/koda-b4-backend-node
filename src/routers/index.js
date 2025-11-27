import { Router } from "express";
import authRouter from "./auth.router.js";
import usersRouter from "./users.admin.route.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/admin/users", usersRouter);

export default router;
