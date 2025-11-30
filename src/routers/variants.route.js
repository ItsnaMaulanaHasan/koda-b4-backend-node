import express from "express";
import { listVariants } from "../controllers/variants.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listVariants);

export default router;
