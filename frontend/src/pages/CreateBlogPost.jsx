import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ConnectionsHeader from "../components/ConnectionsHeader";
import "../styles/CreateBlogPost.css";
const CreateBlogPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moreDescription, setMoreDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authToken = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!authToken) {
      toast.error("You must be logged in to create a blog post.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("moreDescription", moreDescription);
    formData.append(
      "hashtags",
      hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .join(",")
    );

    if (selectedImage) {
      formData.append("profilePic", selectedImage);
    }

    try {
      await axios.post("/api/v1/blogs/create", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      toast.success("Blog post created successfully!");

      setTitle("");
      setDescription("");
      setMoreDescription("");
      setHashtags("");
      setSelectedImage(null);
    } catch (err) {
      console.error(
        "Error creating blog post:",
        err.response?.data || err.message
      );
      toast.error(
        `Failed to create blog post: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ConnectionsHeader />
      <h2>Create New Blog Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="description">Short Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="moreDescription">Full Content:</label>
          <textarea
            id="moreDescription"
            value={moreDescription}
            onChange={(e) => setMoreDescription(e.target.value)}
            rows="8"
          ></textarea>
        </div>

        <div>
          <label htmlFor="hashtags">Hashtags (comma-separated):</label>
          <input
            type="text"
            id="hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="e.g., tech, coding, react"
          />
        </div>

        <div>
          <label htmlFor="image">Featured Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Blog Post"}
        </button>
      </form>
    </>
  );
};

export default CreateBlogPost;
