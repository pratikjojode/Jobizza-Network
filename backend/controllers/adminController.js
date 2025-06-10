import User from "../models/User.js";

export const updateUserRole = async (req, res) => {
  const { userId, email, newRole } = req.body;

  const allowedRoles = ["CEO", "CFO", "CTO", "CHRO", "CXO", "Admin"];
  if ((!userId && !email) || !newRole || !allowedRoles.includes(newRole)) {
    return res
      .status(400)
      .json({ message: "User ID or email, and a valid newRole are required." });
  }

  try {
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (
      req.user &&
      req.user.id === user._id.toString() &&
      newRole !== "Admin"
    ) {
      return res
        .status(403)
        .json({ message: "Admin cannot demote themselves." });
    }

    user.role = newRole;
    await user.save();

    res.status(200).json({
      message: `User role for ${user.email} updated to ${newRole}.`,
      user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error during role update." });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user && req.user.id === user._id.toString()) {
      return res.status(403).json({
        message: "Admin cannot delete their own account via this endpoint.",
      });
    }

    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    const approvedUsers = await User.countDocuments({ isApproved: true });
    const unapprovedUsers = await User.countDocuments({ isApproved: false });

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      approvedUsers,
      unapprovedUsers,
      usersByRole,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res
      .status(500)
      .json({ message: "Server error fetching dashboard statistics." });
  }
};

export const approveUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required for approval." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isApproved) {
      return res.status(400).json({ message: "User is already approved." });
    }

    user.isApproved = true;
    await user.save();

    res
      .status(200)
      .json({ message: `User ${user.email} approved successfully.`, user });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Server error during user approval." });
  }
};

export const getUnapprovedUsers = async (req, res) => {
  try {
    const unapproved = await User.find({ isApproved: false }).select(
      "-password"
    );
    res.status(200).json(unapproved);
  } catch (error) {
    console.error("Error fetching unapproved users:", error);
    res
      .status(500)
      .json({ message: "Server error fetching unapproved users." });
  }
};
