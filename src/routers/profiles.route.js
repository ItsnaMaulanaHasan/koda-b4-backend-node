import express from "express";
import {
  detailProfile,
  updateProfile,
  uploadProfilePhoto,
} from "../controllers/profiles.controller.js";

const router = express();

router.get("", detailProfile);
router.patch("", updateProfile);
router.patch("/photo", uploadProfilePhoto);

export default router;
