import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import {
  getOwnConnectionProfile,
  getUserProfile,
  getUserProfileById,
  updateUserProfile,
} from "../controllers/userController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfileById);
router.put(
  "/updateProfile",
  protect,
  upload.single("profilePic"),
  updateUserProfile
);
router.get("/me", protect, getOwnConnectionProfile);
router.get("/:userId", protect, getUserProfile);

export default router;
