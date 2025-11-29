import express from "express";
import {
  detailProductPublic,
  favouriteProducts,
} from "../controllers/products.public.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("/favourite-products", cache, favouriteProducts);
router.get("/products/:id", cache, detailProductPublic);

export default router;
