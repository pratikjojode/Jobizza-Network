import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ConnectionsHeader from "../components/ConnectionsHeader";
import "../styles/BlogsOverview.css";

const BlogsOverview = () => {
  const [myBlogs, setMyBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loadingMyBlogs, setLoadingMyBlogs] = useState(true);
  const [loadingAllBlogs, setLoadingAllBlogs] = useState(true);
  const [myBlogsError, setMyBlogsError] = useState("");
  const [allBlogsError, setAllBlogsError] = useState("");

  const authToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchMyBlogs = async () => {
      setLoadingMyBlogs(true);
      try {
        if (!authToken) {
          setMyBlogsError("Login to view your blogs.");
          setLoadingMyBlogs(false);
          return;
        }
        const response = await axios.get("/api/v1/blogs/me", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setMyBlogs(response.data.data.blogs);
        setLoadingMyBlogs(false);
      } catch (err) {
        setMyBlogsError(err.response?.data?.message || err.message);
        setLoadingMyBlogs(false);
      }
    };

    fetchMyBlogs();
  }, [authToken]);

  useEffect(() => {
    const fetchAllBlogs = async () => {
      setLoadingAllBlogs(true);
      try {
        const response = await axios.get("/api/v1/blogs"); // Assuming this endpoint gets all blogs
        setAllBlogs(response.data.data.blogs);
        setLoadingAllBlogs(false);
      } catch (err) {
        setAllBlogsError(err.response?.data?.message || err.message);
        setLoadingAllBlogs(false);
      }
    };

    fetchAllBlogs();
  }, []);

  const handleDelete = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await axios.delete(`/api/v1/blogs/${blogId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        toast.success("Blog post deleted successfully!");
        setMyBlogs(myBlogs.filter((blog) => blog._id !== blogId));
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <>
      <ConnectionsHeader />
      <div className="blogs-overview-container">
        <div className="my-blogs-section">
          <h2>My Blog Posts</h2>
          {loadingMyBlogs ? (
            <p className="loading-message">Loading your blogs...</p>
          ) : myBlogsError ? (
            <p className="error-message">{myBlogsError}</p>
          ) : myBlogs.length === 0 ? (
            <p>You haven't created any blog posts yet.</p>
          ) : (
            <ul className="blog-list">
              {myBlogs.map((blog) => (
                <li key={blog._id} className="blog-item">
                  <h3>{blog.title}</h3>
                  <p className="blog-description">
                    {blog.description.substring(0, 150)}...
                  </p>
                  <div className="blog-item-actions">
                    <Link
                      to={`/blogs/edit/${blog._id}`}
                      className="action-button edit-button"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="action-button delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr className="section-divider" />

        <div className="all-blogs-section">
          <h2>All Blog Posts</h2>
          {loadingAllBlogs ? (
            <p className="loading-message">Loading all blogs...</p>
          ) : allBlogsError ? (
            <p className="error-message">{allBlogsError}</p>
          ) : allBlogs.length === 0 ? (
            <p>No blog posts available yet.</p>
          ) : (
            <ul className="blog-list">
              {allBlogs.map((blog) => (
                <li key={blog._id} className="blog-item">
                  <h3>{blog.title}</h3>
                  <p className="blog-description">
                    {blog.description.substring(0, 150)}...
                  </p>
                  <span className="blog-author">
                    By: {blog.authorName || "Anonymous"}
                  </span>
                  <Link
                    to={`/blogs/${blog._id}`}
                    className="action-button view-button"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogsOverview;
