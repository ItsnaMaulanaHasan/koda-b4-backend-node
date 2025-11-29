import express from "express";
import { favouriteProducts } from "../controllers/products.public.controller.js";

const router = express();

router.get("/favourite-products", favouriteProducts);

export default router;
