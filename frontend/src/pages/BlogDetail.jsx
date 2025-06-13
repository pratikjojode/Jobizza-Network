import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"; // useParams to get ID from URL
import { toast } from "react-toastify";
import ConnectionsHeader from "../components/ConnectionsHeader"; // Assuming ConnectionsHeader is in ../components
import "../styles/BlogDetail.css";

const BlogDetail = () => {
  const { blogId } = useParams(); // Get blogId from the URL
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`/api/v1/blogs/${blogId}`);
        setBlog(response.data.data.blog);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch blog post.");
        toast.error(err.response?.data?.message || "Error fetching blog.");
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlogDetails();
    }
  }, [blogId]);

  if (loading) {
    return (
      <>
        <ConnectionsHeader />
        <div className="blogDetailPageContainer">
          <p className="loadingMessage">Loading blog post details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ConnectionsHeader />
        <div className="blogDetailPageContainer">
          <p className="errorMessage">{error}</p>
        </div>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <ConnectionsHeader />
        <div className="blogDetailPageContainer">
          <p className="emptyMessage">Blog post not found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ConnectionsHeader />
      <div className="blogDetailPageContainer">
        <div className="blogDetailCard">
          <div className="blogDetailHeader">
            {/* Author Info */}
            <div className="blogDetailAuthorInfo">
              <Link
                to={`/profile/${blog.userId?._id}`}
                className="blogDetailAuthorLink"
              >
                <img
                  src={
                    blog.userId?.profilePic ||
                    "https://placehold.co/50x50/cccccc/333333?text=NP"
                  }
                  alt={blog.userId?.fullName || "Anonymous"}
                  className="blogDetailAuthorAvatar"
                />
                <div className="blogDetailAuthorText">
                  <span className="blogDetailAuthorName">
                    {blog.userId?.fullName || "Anonymous"}
                  </span>
                  <span className="blogDetailPostDate">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            </div>
            {/* Likes/Dislikes */}
            <div className="blogDetailStats">
              <span className="blogDetailLikeCount">
                👍 {blog.likesCount || 0}
              </span>
              <span className="blogDetailDislikeCount">
                👎 {blog.dislikesCount || 0}
              </span>
            </div>
          </div>

          {/* Blog Image */}
          {blog.imageUrl && (
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="blogDetailMainImage"
            />
          )}

          {/* Blog Title */}
          <h1 className="blogDetailTitle">{blog.title}</h1>

          {/* Blog Description (summary) */}
          <p className="blogDetailDescription">{blog.description}</p>

          {/* More Description (full content) */}
          {blog.moreDescription && (
            <div className="blogDetailMoreDescription">
              <p>{blog.moreDescription}</p>
            </div>
          )}

          {/* Hashtags */}
          {Array.isArray(blog.hashtags) && blog.hashtags.length > 0 && (
            <div className="blogDetailHashtags">
              {blog.hashtags.map((tag, index) => (
                <span key={index} className="blogDetailHashtag">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Back Button */}
          <div className="blogDetailActions">
            <Link to="/blogs" className="blogDetailBackButton">
              Back to All Blogs
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;
