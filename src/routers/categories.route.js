import express from "express";
import { listCategories } from "../controllers/categories.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listCategories);

export default router;
