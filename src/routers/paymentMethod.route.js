import express from "express";
import { listPaymentMethod } from "../controllers/paymentMethod.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listPaymentMethod);

export default router;
