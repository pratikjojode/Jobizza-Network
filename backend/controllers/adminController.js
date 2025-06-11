import User from "../models/User.js";
import cloudinary from "../utils/cloudinaryConfig.js";

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

export const updateUserProfileByAdmin = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const allowedUpdates = [
      "fullName",
      "email",
      "role",
      "company",
      "designation",
      "linkedin",
      "profilePic",
      "financialCertifications",
      "yearsOfFinanceExperience",
      "industrySpecializations",
      "keyFinancialSkills",
      "connections",
      "budgetManaged",
      "isVerified",
      "isApproved",
    ];

    for (const key in updates) {
      if (allowedUpdates.includes(key)) {
        // Special handling for array fields if they are sent as comma-separated strings
        if (
          [
            "financialCertifications",
            "industrySpecializations",
            "keyFinancialSkills",
            "connections",
          ].includes(key) &&
          typeof updates[key] === "string"
        ) {
          user[key] = updates[key]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (key === "yearsOfFinanceExperience") {
          user[key] = Number(updates[key]) || 0;
        } else {
          user[key] = updates[key];
        }
      }
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully.", data: user });
  } catch (error) {
    console.error("Error updating user by admin:", error);
    res.status(500).json({ message: "Server error during user update." });
  }
};

export const uploadProfilePic = async (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      {
        folder: "profile_pics",
        public_id: `user-${id}-profile`,
        overwrite: true,
      }
    );

    user.profilePic = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully.",
      profilePicUrl: user.profilePic,
      data: user,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res
      .status(500)
      .json({ message: "Server error during profile picture upload." });
  }
};
