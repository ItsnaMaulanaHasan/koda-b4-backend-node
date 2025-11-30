import express from "express";
import { checkout } from "../controllers/transactions.controller.js";

const router = express();

router.post("", checkout);

export default router;
