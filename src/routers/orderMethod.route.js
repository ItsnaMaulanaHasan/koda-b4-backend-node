import express from "express";
import { listOrderMethod } from "../controllers/orderMethod.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listOrderMethod);

export default router;
