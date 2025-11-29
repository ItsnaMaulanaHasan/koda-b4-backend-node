import express from "express";
import { favouriteProducts } from "../controllers/products.public.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("/favourite-products", cache, favouriteProducts);

export default router;
