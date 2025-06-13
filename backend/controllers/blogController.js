import Blog from "../models/blogModel.js";
import cloudinary from "cloudinary";

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("userId");
    res.status(200).json({
      status: "success",
      results: blogs.length,
      data: {
        blogs,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("userId");
    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "No blog found with that ID",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const createBlog = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ status: "fail", message: "User not authenticated." });
    }

    const { title, description, moreDescription, hashtags } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        status: "fail",
        message: "Title and description are required.",
      });
    }

    let imageUrl = "";
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cloudinaryResult = await cloudinary.v2.uploader.upload(dataURI, {
        folder: "blog_images",
      });
      imageUrl = cloudinaryResult.secure_url;
    }

    const newBlog = await Blog.create({
      title,
      description,
      moreDescription,
      imageUrl,
      hashtags: hashtags ? hashtags.split(",").map((tag) => tag.trim()) : [],
      userId: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: {
        blog: newBlog,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        status: "fail",
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      status: "error",
      message: "Failed to create blog post due to a server error.",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "No blog found with that ID",
      });
    }

    const updateData = { ...req.body };

    // Handle hashtags specifically as they might be sent as a comma-separated string
    if (updateData.hashtags && typeof updateData.hashtags === "string") {
      updateData.hashtags = updateData.hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    } else if (updateData.hashtags === "") {
      // Handle empty string clearing hashtags
      updateData.hashtags = [];
    }

    if (req.file) {
      // Convert buffer to Base64 data URI for Cloudinary upload
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      // Upload image to Cloudinary
      const cloudinaryResult = await cloudinary.v2.uploader.upload(dataURI, {
        folder: "blog_images",
      });

      updateData.imageUrl = cloudinaryResult.secure_url;
    } else if (req.body.imageUrl === "") {
      // This handles cases where the user explicitly clears the image URL without uploading a new file
      updateData.imageUrl = "";
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        blog: updatedBlog,
      },
    });
  } catch (err) {
    console.error("Error updating blog with image:", err);
    res.status(400).json({
      status: "fail",
      message: err.message || "Failed to update blog.",
      error: process.env.NODE_ENV === "development" ? err : undefined,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: "fail",
        message: "No blog found with that ID",
      });
    }

    if (blog.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action.",
      });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null, // No content for a successful delete
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ userId: req.user._id })
      .populate("userId", "fullName")
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      data: {
        blogs,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch your blogs.",
    });
  }
};

export const getLatestBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const latestBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "fullName profilePic");

    res.status(200).json({
      status: "success",
      results: latestBlogs.length,
      data: latestBlogs,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
