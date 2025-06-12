// routes/blogRoutes.js

import express from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlog,
  updateBlog,
} from "../controllers/blogController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllBlogs);

router.post("/create", protect, upload.single("profilePic"), createBlog);

router.get("/:id", getBlog);

router.put("/:id", protect, upload.single("profilePic"), updateBlog);

router.delete("/:id", protect, deleteBlog);

export default router;
