import express from "express";
import {
  detailProfile,
  updateProfile,
  uploadProfilePhoto,
} from "../controllers/profiles.controller.js";
import { cache } from "../middlewares/caching.js";

const router = express();

router.get("", cache, detailProfile);
router.patch("", updateProfile);
router.patch("/photo", uploadProfilePhoto);

export default router;
