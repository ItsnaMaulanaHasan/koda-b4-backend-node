import express from "express";
import { listSizes } from "../controllers/sizes.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listSizes);

export default router;
