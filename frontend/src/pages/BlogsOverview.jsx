import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ConnectionsHeader from "../components/ConnectionsHeader";
import Footer from "../components/Footer";
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
          setMyBlogsError("Login to view and manage your blogs.");
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
        const response = await axios.get("/api/v1/blogs");
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

  const BlogCard = ({ blog, isMyBlog = false }) => (
    <div className="blogOverviewCard">
      <Link to={`/profile/${blog.userId?._id}`} className="blogCardContentLink">
        <div className="blogCardHeaderContent">
          <div className="blogAuthorInfo">
            <img
              src={
                blog.userId?.profilePic ||
                "https://placehold.co/40x40/add8e6/003366?text=NP" // Updated placeholder
              }
              alt={blog.userId?.fullName || "Anonymous"}
              className="blogAuthorAvatar"
            />
            <div className="blogAuthorNameDate">
              <span className="blogAuthorFullName">
                {blog.userId?.fullName || "Anonymous"}
              </span>
              <span className="blogPostDate">
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <h3 className="blogCardTitle">{blog.title}</h3>
        {blog.imageUrl && (
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="blogCardMainImage"
          />
        )}
        <p className="blogCardDescription">
          {blog.description?.substring(0, 180)}...
        </p>
        {blog.moreDescription && (
          <p className="blogCardMoreDescription">
            <strong>More:</strong> {blog.moreDescription?.substring(0, 120)}...
          </p>
        )}
        {Array.isArray(blog.hashtags) && blog.hashtags.length > 0 && (
          <div className="blogCardHashtags">
            {blog.hashtags.map((tag, index) => (
              <span key={index} className="blogHashtag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="blogCardStats">
          <span>👍 {blog.likesCount || 0}</span>
          <span>👎 {blog.dislikesCount || 0}</span>
        </div>
      </Link>
      <div className="blogCardActionsRow">
        {isMyBlog && (
          <>
            <Link
              to={`/blogs/edit/${blog._id}`}
              className="blogActionButton blogEditButton"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(blog._id)}
              className="blogActionButton blogDeleteButton"
            >
              Delete
            </button>
          </>
        )}
        <Link
          to={`/blogs/${blog._id}`}
          className="blogActionButton blogViewButton"
        >
          View
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <ConnectionsHeader />
      <div className="blogsOverviewContainer">
        <div className="blogsSectionCard myBlogsSection">
          <h2 className="sectionTitle">My Blog Posts</h2>
          {loadingMyBlogs ? (
            <p className="statusMessage loadingMessage">Loading your blogs...</p>
          ) : myBlogsError ? (
            <p className="statusMessage errorMessage">{myBlogsError}</p>
          ) : myBlogs.length === 0 ? (
            <p className="statusMessage emptyMessage">
              You haven't created any blog posts yet.
            </p>
          ) : (
            <div className="blogsGrid">
              {myBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} isMyBlog />
              ))}
            </div>
          )}
        </div>

        <hr className="blogsSectionDivider" />

        <div className="blogsSectionCard allBlogsSection">
          <h2 className="sectionTitle">All Blog Posts</h2>
          {loadingAllBlogs ? (
            <p className="statusMessage loadingMessage">Loading all blogs...</p>
          ) : allBlogsError ? (
            <p className="statusMessage errorMessage">{allBlogsError}</p>
          ) : allBlogs.length === 0 ? (
            <p className="statusMessage emptyMessage">No blog posts available yet.</p>
          ) : (
            <div className="blogsGrid">
              {allBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default BlogsOverview;