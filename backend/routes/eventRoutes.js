import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  updateEvent,
} from "../controllers/eventController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Your authentication middleware
import upload from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post("/", protect, upload.single("profilePic"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", protect, upload.single("profilePic"), updateEvent);
router.delete("/:id", protect, deleteEvent);

export default router;
