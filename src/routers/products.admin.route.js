import express from "express";
import {
  createProduct,
  deleteProduct,
  detailProductAdmin,
  listProductsAdmin,
  updateProduct,
} from "../controllers/products.controller.js";
import { cache } from "../middlewares/caching.js";

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         fileImages:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Upload up to 4 images
 *         name:
 *           type: string
 *           example: Bebek saus padang
 *         description:
 *           type: string
 *           example: Bebek saus padang with asparagus
 *         price:
 *           type: number
 *           example: 25000
 *         discountPercent:
 *           type: number
 *           example: 10
 *         rating:
 *           type: number
 *           example: 5
 *         stock:
 *           type: integer
 *           example: 100
 *         isFlashSale:
 *           type: boolean
 *           example: false
 *         isActive:
 *           type: boolean
 *           example: true
 *         isFavourite:
 *           type: boolean
 *           example: false
 *         sizeProducts:
 *           type: string
 *           example: "1,2,3"
 *         productCategories:
 *           type: string
 *           example: "1,2"
 *         productVariants:
 *           type: string
 *           example: "1,2"

 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         fileImages:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Upload up to 4 images (optional)
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         discountPercent:
 *           type: number
 *         rating:
 *           type: number
 *         stock:
 *           type: integer
 *         isFlashSale:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         isFavourite:
 *           type: boolean
 *         sizeProducts:
 *           type: string
 *         productCategories:
 *           type: string
 *         productVariants:
 *           type: string
 */

const router = express();

router.get("", cache, listProductsAdmin);
router.get("/:id", cache, detailProductAdmin);
router.post("", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
