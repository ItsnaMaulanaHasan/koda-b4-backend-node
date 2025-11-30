import express from "express";
import { listPaymentMethods } from "../controllers/paymentMethod.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listPaymentMethods);

export default router;
