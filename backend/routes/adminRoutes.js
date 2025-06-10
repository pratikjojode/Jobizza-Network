import express from "express";
import {
  updateUserRole,
  getUserDetails,
  getAllUsers,
  deleteUser,
  getDashboardStats,
  approveUser,
  getUnapprovedUsers,
} from "../controllers/adminController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

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
