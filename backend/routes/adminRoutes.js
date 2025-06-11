import express from "express";
import {
  updateUserRole,
  getUserDetails,
  getAllUsers,
  deleteUser,
  getDashboardStats,
  approveUser,
  getUnapprovedUsers,
  updateUserProfileByAdmin,
  uploadProfilePic,
} from "../controllers/adminController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// User Management Routes
router.put("/users/update-role", protect, admin, updateUserRole);
router.get("/users", protect, admin, getAllUsers);
router.get("/users/:id", protect, admin, getUserDetails);
router.delete("/users/:id", protect, admin, deleteUser);

// Admin Dashboard Specific Routes
router.get("/dashboard-stats", protect, admin, getDashboardStats);
router.put("/users/:id", protect, admin, updateUserProfileByAdmin);
router.put("/users/approve", protect, admin, approveUser);
router.get("/users/unapproved", protect, admin, getUnapprovedUsers);
router.put(
  "/users/:id/profile-pic",
  protect,
  admin,
  upload.single("profilePic"),
  uploadProfilePic
);

export default router;
