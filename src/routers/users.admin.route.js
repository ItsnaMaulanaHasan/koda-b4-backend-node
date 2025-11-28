import express from "express";
import {
  createUser,
  deleteUser,
  detailUser,
  listUsers,
  updateUser,
} from "../controllers/users.controller.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/users.validator.js";

const router = express();

router.get("", listUsers);
router.get("/:id", detailUser);
router.post("", createUserSchema, createUser);
router.patch("/:id", updateUserSchema, updateUser);
router.delete("/:id", deleteUser);

export default router;
