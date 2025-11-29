import express from "express";
import {
  detailTransaction,
  listTransactions,
  updateStatusTransaction,
} from "../controllers/transactions.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listTransactions);
router.get("/:id", cache, detailTransaction);
router.patch("", updateStatusTransaction);

export default router;
