import express from "express";
import {
  detailHistory,
  listHistories,
} from "../controllers/histories.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listHistories);
router.get("/:noinvoice", cache, detailHistory);

export default router;
