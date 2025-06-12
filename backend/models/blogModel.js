import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A blog post must have a title."],
    trim: true,
    maxlength: [200, "Title cannot be more than 200 characters."],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "A blog post must belong to a user."],
  },
  description: {
    type: String,
    required: [true, "A blog post must have a description."],
    trim: true,
    maxlength: [500, "Description cannot be more than 500 characters."],
  },
  moreDescription: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  hashtags: [String],
  likesCount: {
    type: Number,
    default: 0,
  },
  dislikesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

blogSchema.index({ title: 1 });
blogSchema.index({ userId: 1 });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
