import express from "express";
import {
  addCart,
  deleteCart,
  listCarts,
} from "../controllers/carts.controller.js";

const router = express();

router.get("", listCarts);
router.post("", addCart);
router.delete("/:id", deleteCart);

export default router;
