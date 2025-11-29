import express from "express";
import {
  detailProfiles,
  updateProfile,
  uploadProfilePhoto,
} from "../controllers/profiles.controller.js";

const router = express();

router.get("", detailProfiles);
router.patch("", updateProfile);
router.patch("/photo", uploadProfilePhoto);

export default router;
