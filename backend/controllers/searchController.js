import User from "../models/User.js";

export const searchUsers = async (req, res) => {
  try {
    const { q, filter } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required.",
      });
    }

    const searchQuery = q.trim();
    let results = [];

    if (filter === "all" || filter === "people") {
      const users = await User.find({
        $or: [
          { fullName: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
          { designation: { $regex: searchQuery, $options: "i" } },
          { company: { $regex: searchQuery, $options: "i" } },
        ],
      }).select("fullName email designation company profilePic isVerified");

      results = users;
    }

    res.status(200).json({
      success: true,
      data: {
        results,
        count: results.length,
      },
      message: "Search results fetched successfully.",
    });
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the search.",
      error: error.message,
    });
  }
};
