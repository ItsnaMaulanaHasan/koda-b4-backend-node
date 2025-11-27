import express from "express";
import {
  createUser,
  deleteUser,
  detailUser,
  listUsers,
  updateUser,
} from "../controllers/users.controller.js";

const router = express();

router.get("", listUsers);
router.get("/:id", detailUser);
router.post("", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
