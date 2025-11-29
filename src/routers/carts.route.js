import express from "express";
import {
  addCart,
  deleteCart,
  listCarts,
} from "../controllers/carts.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listCarts);
router.post("", addCart);
router.delete("", deleteCart);

export default router;
