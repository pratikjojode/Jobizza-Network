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
  getConnectionSuggestions,
} from "../controllers/connectionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Get all connection requests (admin view)
router.get("/", getAllConnectionRequests);

router.get("/suggestions", getConnectionSuggestions);
// Send a new connection request
router.post("/", sendConnectionRequest);

// Get all users for connection (with connection status)
router.get("/all-users", getAllUsersForConnection);

// Get user's own connections
router.get("/my-connections", getMyConnections);

// Get sent pending requests
router.get("/my-connections/sent-pending", getSentPendingRequests);

// Get received pending requests
router.get("/my-connections/received-pending", getReceivedPendingRequests);

// Accept a connection request
router.put("/:id/accept", acceptConnectionRequest);

// Decline a connection request
router.put("/:id/decline", declineConnectionRequest);

// Cancel a sent connection request (delete pending request)
router.delete("/:id", cancelConnectionRequest);

// Remove an accepted connection
router.delete("/:id/remove", removeConnection);

// Bulk delete connections (you'll need to implement this controller)
router.post("/bulk-delete", async (req, res, next) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of connection IDs to delete.",
      });
    }

    // Import ConnectionRequest model
    const { default: ConnectionRequest } = await import(
      "../models/ConnectionRequest.js"
    );

    // Find connections that belong to the user (either as sender or receiver)
    const connections = await ConnectionRequest.find({
      _id: { $in: ids },
      $or: [{ sender: userId }, { receiver: userId }],
    });

    if (connections.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No connections found that you can delete.",
      });
    }

    // Delete the connections
    await ConnectionRequest.deleteMany({
      _id: { $in: connections.map((conn) => conn._id) },
    });

    res.status(200).json({
      success: true,
      message: `${connections.length} connections deleted successfully.`,
      deletedCount: connections.length,
    });
  } catch (error) {
    next(error);
  }
});

// Permanent delete endpoint (same as bulk delete for single connection)
router.delete("/:id/delete-permanent", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Import ConnectionRequest model
    const { default: ConnectionRequest } = await import(
      "../models/ConnectionRequest.js"
    );

    const connection = await ConnectionRequest.findOne({
      _id: id,
      $or: [{ sender: userId }, { receiver: userId }],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message:
          "Connection not found or you don't have permission to delete it.",
      });
    }

    await ConnectionRequest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Connection permanently deleted.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
