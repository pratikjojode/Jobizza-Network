import ConnectionRequest from "../models/ConnectionRequest.js";
import User from "../models/User.js";

export const sendConnectionRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself.",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, message: "Receiver user not found." });
    }

    // Check if connection already exists in any state
    const existingConnection = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingConnection) {
      let message = "";
      switch (existingConnection.status) {
        case "pending":
          if (existingConnection.sender.toString() === senderId) {
            message = "Connection request already sent and pending.";
          } else {
            message = "You have a pending connection request from this user.";
          }
          break;
        case "accepted":
          message = "You are already connected with this user.";
          break;
        case "declined":
          message = "Connection request was previously declined.";
          break;
        default:
          message = "Connection request already exists.";
      }

      return res.status(409).json({
        success: false,
        message: message,
        existingConnection: {
          id: existingConnection._id,
          status: existingConnection.status,
          sender: existingConnection.sender,
          receiver: existingConnection.receiver,
        },
      });
    }

    const connection = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent successfully!",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptConnectionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await ConnectionRequest.findById(id);

    if (!connection) {
      return res
        .status(404)
        .json({ success: false, message: "Connection request not found." });
    }

    if (
      connection.receiver.toString() !== userId ||
      connection.status !== "pending"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to accept this request or it is not pending.",
      });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection request accepted!",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

export const declineConnectionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await ConnectionRequest.findById(id);

    if (!connection) {
      return res
        .status(404)
        .json({ success: false, message: "Connection request not found." });
    }

    if (
      connection.receiver.toString() !== userId ||
      connection.status !== "pending"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to decline this request or it is not pending.",
      });
    }

    connection.status = "declined";
    await connection.save();

    res.status(200).json({
      success: true,
      message: "Connection request declined!",
      data: connection,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelConnectionRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await ConnectionRequest.findById(id);

    if (!connection) {
      return res
        .status(404)
        .json({ success: false, message: "Connection request not found." });
    }

    if (
      connection.sender.toString() !== userId ||
      connection.status !== "pending"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to cancel this request or it is not pending.",
      });
    }

    await ConnectionRequest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Connection request cancelled.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const removeConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await ConnectionRequest.findById(id);

    if (!connection) {
      return res
        .status(404)
        .json({ success: false, message: "Connection not found." });
    }

    if (
      connection.status !== "accepted" ||
      (!connection.sender.equals(userId) && !connection.receiver.equals(userId))
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to remove this connection or it is not an active connection.",
      });
    }

    await ConnectionRequest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Connection removed.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyConnections = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const connections = await ConnectionRequest.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "fullName email profilePic")
      .populate("receiver", "fullName email profilePic");

    const populatedConnections = connections.map((conn) => {
      if (conn.sender._id.equals(userId)) {
        return {
          _id: conn._id,
          connectedUser: conn.receiver,
          status: conn.status,
          createdAt: conn.createdAt,
          updatedAt: conn.updatedAt,
        };
      } else {
        return {
          _id: conn._id,
          connectedUser: conn.sender,
          status: conn.status,
          createdAt: conn.createdAt,
          updatedAt: conn.updatedAt,
        };
      }
    });

    res.status(200).json({
      success: true,
      count: populatedConnections.length,
      data: populatedConnections,
    });
  } catch (error) {
    next(error);
  }
};

export const getSentPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const requests = await ConnectionRequest.find({
      sender: userId,
      status: "pending",
    }).populate("receiver", "fullName email profilePic");

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const requests = await ConnectionRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "fullName email profilePic");

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllConnectionRequests = async (req, res) => {
  try {
    const connections = await ConnectionRequest.find()
      .populate("sender", "fullName email profilePic")
      .populate("receiver", "fullName email profilePic");

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsersForConnection = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const users = await User.find({ _id: { $ne: currentUserId } });

    // Get all connection requests involving the current user
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    });

    const connectionMap = new Map();

    connectionRequests.forEach((request) => {
      const otherUserId =
        request.sender.toString() === currentUserId
          ? request.receiver.toString()
          : request.sender.toString();

      let connectionStatus;

      if (request.status === "pending") {
        if (request.sender.toString() === currentUserId) {
          connectionStatus = "pending_sent";
        } else {
          connectionStatus = "pending_received";
        }
      } else if (request.status === "accepted") {
        connectionStatus = "connected";
      } else if (request.status === "declined") {
        // For declined requests, check who declined
        if (request.receiver.toString() === currentUserId) {
          // Current user declined the request
          connectionStatus = "declined_by_me";
        } else {
          // Other user declined the request
          connectionStatus = "declined_by_them";
        }
      }

      connectionMap.set(otherUserId, {
        connectionStatus,
        connectionId: request._id.toString(),
        requestStatus: request.status,
        isSender: request.sender.toString() === currentUserId,
      });
    });

    const usersWithConnectionStatus = users.map((user) => {
      const userId = user._id.toString();
      const connectionInfo = connectionMap.get(userId);

      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        designation: user.designation,
        company: user.company,
        connectionStatus: connectionInfo?.connectionStatus || "not_connected",
        connectionId: connectionInfo?.connectionId || null,
        canConnect:
          !connectionInfo ||
          connectionInfo.connectionStatus === "declined_by_them" ||
          connectionInfo.connectionStatus === "declined_by_me",
        buttonText: getButtonText(
          connectionInfo?.connectionStatus || "not_connected"
        ),
        buttonAction: getButtonAction(
          connectionInfo?.connectionStatus || "not_connected"
        ),
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithConnectionStatus.length,
      data: usersWithConnectionStatus,
    });
  } catch (error) {
    console.log("Error fetching all users for connection:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to determine button text based on connection status
function getButtonText(status) {
  switch (status) {
    case "connected":
      return "Connected";
    case "pending_sent":
      return "Request Sent";
    case "pending_received":
      return "Accept Request";
    case "declined_by_me":
      return "Connect";
    case "declined_by_them":
      return "Connect";
    case "not_connected":
    default:
      return "Connect";
  }
}

// Helper function to determine button action based on connection status
function getButtonAction(status) {
  switch (status) {
    case "connected":
      return "remove";
    case "pending_sent":
      return "cancel";
    case "pending_received":
      return "accept";
    case "declined_by_me":
      return "connect";
    case "declined_by_them":
      return "connect";
    case "not_connected":
    default:
      return "connect";
  }
}

export const getConnectionSuggestions = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const existingConnections = await ConnectionRequest.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
      status: { $in: ["pending", "accepted"] },
    }).select("sender receiver status");

    const connectedOrPendingUserIds = new Set();
    existingConnections.forEach((conn) => {
      if (conn.sender.toString() === currentUserId.toString()) {
        connectedOrPendingUserIds.add(conn.receiver.toString());
      } else {
        connectedOrPendingUserIds.add(conn.sender.toString());
      }
    });

    connectedOrPendingUserIds.add(currentUserId.toString());

    const suggestions = await User.find({
      _id: { $nin: Array.from(connectedOrPendingUserIds) },
    })
      .select("fullName profilePic designation company")
      .limit(10);

    const suggestionsWithStatus = suggestions.map((user) => ({
      _id: user._id,
      fullName: user.fullName,
      profilePic: user.profilePic,
      designation: user.designation,
      company: user.company,
      connectionStatus: "not_connected",
    }));

    res.status(200).json({
      status: "success",
      results: suggestionsWithStatus.length,
      data: {
        suggestions: suggestionsWithStatus,
      },
    });
  } catch (err) {
    console.error("Error getting connection suggestions:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve connection suggestions.",
      error: err.message,
    });
  }
};
