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

    res.status(204).json({
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

    res.status(204).json({
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
      .populate("sender", "fullName email profilePic") // Populates sender's details
      .populate("receiver", "fullName email profilePic"); // Populates receiver's details

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections,
    });
  } catch (error) {
    // Basic error handling for the controller without external error handlers
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllUsersForConnection = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log("Error fetching all users for connection:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
