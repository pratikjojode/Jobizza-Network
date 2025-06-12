import express from "express";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  cancelConnectionRequest,
  removeConnection,
  getMyConnections,
  getSentPendingRequests,
  getReceivedPendingRequests,
  getAllConnectionRequests,
  getAllUsersForConnection,
  getOwnConnectionProfile,
} from "../controllers/connectionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", protect, getAllConnectionRequests);
router.post("/", sendConnectionRequest);

router.get("/me", protect, getOwnConnectionProfile);
router.get("/all-users", getAllUsersForConnection);
router.get("/my-connections", getMyConnections);

router.get("/my-connections/sent-pending", getSentPendingRequests);

router.get("/my-connections/received-pending", getReceivedPendingRequests);

router.put("/:id/accept", acceptConnectionRequest);

router.put("/:id/decline", declineConnectionRequest);

router.delete("/:id", cancelConnectionRequest);

router.delete("/:id/remove", removeConnection);

export default router;
