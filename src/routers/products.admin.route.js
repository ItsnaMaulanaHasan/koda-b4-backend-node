import express from "express";
import {
  createProduct,
  deleteProduct,
  detailProductAdmin,
  listProductsAdmin,
  updateProduct,
} from "../controllers/products.controller.js";

const router = express();

router.get("", listProductsAdmin);
router.get("/:id", detailProductAdmin);
router.post("", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
