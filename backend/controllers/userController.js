import Event from "../models/eventModel.js";
import User from "../models/User.js";

export const getUserProfileById = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required or not authenticated.",
      });
    }

    const user = await User.findById(userId).select("-password -otp -role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user ID not found in token.",
      });
    }

    const user = await User.findById(userId);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.profilePic = req.body.profilePic || user.profilePic;
      user.company = req.body.company || user.company;
      user.designation = req.body.designation || user.designation;
      user.linkedin = req.body.linkedin || user.linkedin;
      user.budgetManaged = req.body.budgetManaged || user.budgetManaged;
      user.yearsOfFinanceExperience =
        req.body.yearsOfFinanceExperience || user.yearsOfFinanceExperience;
      user.financialCertifications =
        req.body.financialCertifications || user.financialCertifications;
      user.industrySpecializations =
        req.body.industrySpecializations || user.industrySpecializations;
      user.keyFinancialSkills =
        req.body.keyFinancialSkills || user.keyFinancialSkills;
      user.bio = req.body.bio || user.bio;

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        user: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          profilePic: updatedUser.profilePic,
          company: updatedUser.company,
          designation: updatedUser.designation,
          role: updatedUser.role,
          linkedin: updatedUser.linkedin,
          budgetManaged: updatedUser.budgetManaged,
          yearsOfFinanceExperience: updatedUser.yearsOfFinanceExperience,
          isVerified: updatedUser.isVerified,
          isApproved: updatedUser.isApproved,
          createdAt: updatedUser.createdAt,
          financialCertifications: updatedUser.financialCertifications,
          industrySpecializations: updatedUser.industrySpecializations,
          keyFinancialSkills: updatedUser.keyFinancialSkills,
          bio: updatedUser.bio,
        },
        message: "User profile updated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOwnConnectionProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const userProfile = await User.findById(userId).select(
      "fullName email designation company yearsOfFinanceExperience financialCertifications industrySpecializations keyFinancialSkills budgetManaged linkedin profilePic isVerified"
    );

    if (!userProfile) {
      return res.status(404).json({
        status: "fail",
        message: "Your profile could not be found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: userProfile,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID format.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching your profile.",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const userProfile = await User.findById(userId).select(
      "fullName email designation company yearsOfFinanceExperience financialCertifications industrySpecializations keyFinancialSkills budgetManaged linkedin profilePic isVerified"
    );

    if (!userProfile) {
      return res.status(404).json({
        status: "fail",
        message: "User profile not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: userProfile,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID format.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching the user profile.",
    });
  }
};

export const getAllUsersForDash = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

export const getEventsByUserId = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.params.userId })
      .populate(
        "organizer",
        "fullName designation company role profilePic linkedin"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: {
        events: events,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
