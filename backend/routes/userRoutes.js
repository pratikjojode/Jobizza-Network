import express from "express";

import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllUsersForDash,
  getEventsByUserId,
  getOwnConnectionProfile,
  getUserProfile,
  getUserProfileById,
  updateUserProfile,
} from "../controllers/userController.js";
import upload from "../middlewares/uploadMiddleware.js";
import { getUserBlogs } from "../controllers/blogController.js";

const router = express.Router();

router.get("/profile", protect, getUserProfileById);
router.get("/user/:userId", getEventsByUserId);
router.get("/all-users-dash", getAllUsersForDash);
router.get("/:userId/blogs", getUserBlogs);
router.put(
  "/updateProfile",
  protect,
  upload.single("profilePic"),
  updateUserProfile
);
router.get("/me", protect, getOwnConnectionProfile);
router.get("/:userId", protect, getUserProfile);

export default router;
