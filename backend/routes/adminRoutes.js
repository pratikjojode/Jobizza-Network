import express from "express";
import {
  updateUserRole,
  getUserDetails,
  getAllUsers,
  deleteUser,
  getDashboardStats, // Added
  approveUser, // Added
  getUnapprovedUsers, // Added
} from "../controllers/adminController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes here will require both `protect` (logged in) and `admin` (admin role) middleware

// User Management Routes
router.put("/users/update-role", protect, admin, updateUserRole);
router.get("/users", protect, admin, getAllUsers);
router.get("/users/:id", protect, admin, getUserDetails);
router.delete("/users/:id", protect, admin, deleteUser);

// Admin Dashboard Specific Routes
router.get("/dashboard-stats", protect, admin, getDashboardStats);
router.put("/users/approve", protect, admin, approveUser);
router.get("/users/unapproved", protect, admin, getUnapprovedUsers);

export default router;
