import express from "express";
import { listOrderMethods } from "../controllers/orderMethod.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, listOrderMethods);

export default router;
