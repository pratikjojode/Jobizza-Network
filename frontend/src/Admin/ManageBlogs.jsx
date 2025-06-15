import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/ManageBlogs.css";

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlogIds, setSelectedBlogIds] = useState([]);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editedBlogData, setEditedBlogData] = useState({});
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const confirmActionRef = useRef(null);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState("");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateModalMessage, setUpdateModalMessage] = useState("");

  const [showBlogDetailModal, setShowBlogDetailModal] = useState(false);
  const [selectedBlogForDetail, setSelectedBlogForDetail] = useState(null);

  const fileInputRef = useRef(null);

  const authToken = localStorage.getItem("token");

  const showConfirmation = (message, action) => {
    setConfirmModalMessage(message);
    confirmActionRef.current = action;
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmActionRef.current) {
      confirmActionRef.current();
    }
    setShowConfirmModal(false);
    setConfirmModalMessage("");
    confirmActionRef.current = null;
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmModalMessage("");
    confirmActionRef.current = null;
  };

  const showAlert = (message) => {
    setAlertModalMessage(message);
    setShowAlertModal(true);
  };

  const handleCloseAlert = () => {
    setShowAlertModal(false);
    setAlertModalMessage("");
  };

  const handleCloseUpdate = () => {
    setShowUpdateModal(false);
    setUpdateModalMessage("");
  };

  const handleViewBlog = (blog) => {
    setSelectedBlogForDetail(blog);
    setShowBlogDetailModal(true);
  };

  const handleCloseBlogDetailModal = () => {
    setShowBlogDetailModal(false);
    setSelectedBlogForDetail(null);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/v1/blogs");
      setBlogs(response.data.data.blogs);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      console.error("Error fetching blogs:", err);
      showAlert("Failed to fetch blogs!");
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (blogId) => {
    showConfirmation("Are you sure you want to delete this blog?", async () => {
      try {
        await axios.delete(`/api/v1/blogs/${blogId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        await fetchBlogs();
        setSelectedBlogIds((prev) => prev.filter((id) => id !== blogId));
        showAlert("Blog deleted successfully!");
      } catch (err) {
        setError(err);
        console.error("Error deleting blog:", err);
        showAlert(
          `Failed to delete blog: ${err.response?.data?.message || err.message}`
        );
      }
    });
  };

  const handleEditClick = (blog) => {
    setEditingBlogId(blog._id);
    setEditedBlogData({
      title: blog.title,
      description: blog.description,
      moreDescription: blog.moreDescription,
      imageUrl: blog.imageUrl,
      hashtags: blog.hashtags ? blog.hashtags.join(", ") : "",
    });
    setSelectedImageFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedBlogData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageFileChange = (e) => {
    setSelectedImageFile(e.target.files[0]);
  };

  const handleImageUploadButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSaveEdit = async (blogId) => {
    try {
      const formData = new FormData();

      formData.append("title", editedBlogData.title || "");
      formData.append("description", editedBlogData.description || "");
      formData.append("moreDescription", editedBlogData.moreDescription || "");

      formData.append(
        "hashtags",
        editedBlogData.hashtags
          ? editedBlogData.hashtags
              .split(",")
              .map((tag) => tag.trim())
              .join(",")
          : ""
      );

      if (selectedImageFile) {
        formData.append("profilePic", selectedImageFile);
      } else {
        formData.append("imageUrl", editedBlogData.imageUrl || "");
      }

      await axios.put(`/api/v1/blogs/${blogId}`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setEditingBlogId(null);
      setEditedBlogData({});
      setSelectedImageFile(null);
      await fetchBlogs();
      setShowUpdateModal(true);
      setUpdateModalMessage("Blog updated successfully!");
    } catch (err) {
      setError(err);
      console.error("Error updating blog:", err.response?.data || err.message);
      showAlert(
        `Failed to update blog: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingBlogId(null);
    setEditedBlogData({});
    setSelectedImageFile(null);
  };

  const handleExportCsv = () => {
    if (blogs.length === 0) {
      showAlert("No blogs to export!");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Author",
      "Description",
      "More Description",
      "Image URL",
      "Likes",
      "Dislikes",
      "Hashtags",
      "Created At",
      "Updated At",
    ];
    const csvContent = [
      headers.join(","),
      ...blogs.map((blog) => {
        const authorName = blog.userId ? blog.userId.fullName : "Unknown";
        const hashtags = blog.hashtags ? `"${blog.hashtags.join(";")}"` : "";
        const row = [
          blog._id,
          `"${blog.title.replace(/"/g, '""')}"`,
          `"${authorName.replace(/"/g, '""')}"`,
          `"${(blog.description || "").replace(/"/g, '""')}"`,
          `"${(blog.moreDescription || "").replace(/"/g, '""')}"`,
          `"${(blog.imageUrl || "").replace(/"/g, '""')}"`,
          blog.likesCount,
          blog.dislikesCount,
          hashtags,
          blog.createdAt,
          blog.updatedAt,
        ];
        return row.join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "blogs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert("Blogs exported to CSV!");
  };

  const handleSelectBlog = (blogId) => {
    setSelectedBlogIds((prevSelected) =>
      prevSelected.includes(blogId)
        ? prevSelected.filter((id) => id !== blogId)
        : [...prevSelected, blogId]
    );
  };

  const confirmBulkDelete = async () => {
    if (selectedBlogIds.length === 0) {
      showAlert("No blogs selected for bulk delete.");
      return;
    }

    try {
      await Promise.all(
        selectedBlogIds.map((id) =>
          axios.delete(`/api/v1/blogs/${id}`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        )
      );
      setSelectedBlogIds([]);
      await fetchBlogs();
      showAlert("Selected blogs deleted successfully!");
    } catch (err) {
      setError(err);
      console.error("Error during bulk delete:", err);
      showAlert(
        `Failed to perform bulk delete: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const handleBulkDelete = () => {
    if (selectedBlogIds.length === 0) {
      showAlert("No blogs selected for bulk delete.");
      return;
    }
    showConfirmation(
      `Are you sure you want to delete ${selectedBlogIds.length} selected blogs?`,
      confirmBulkDelete
    );
  };

  if (loading) {
    return <div className="loading-message">Loading blogs...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        Error: {error.message || "Something went wrong!"}
      </div>
    );
  }

  return (
    <div className="manage-blogs-container">
      <h1>Manage Blogs</h1>
      <div className="manage-blogs-header">
        <button onClick={handleExportCsv} className="btn">
          Export to CSV
        </button>
        {selectedBlogIds.length > 0 && (
          <button onClick={handleBulkDelete} className="btn btn-delete">
            Delete Selected ({selectedBlogIds.length})
          </button>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: "5px" }}>
          <button
            onClick={() => setViewMode("grid")}
            className={`btn view-btn ${viewMode === "grid" ? "active" : ""}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`btn view-btn ${viewMode === "table" ? "active" : ""}`}
          >
            Table View
          </button>
        </div>
      </div>

      {blogs.length === 0 ? (
        <p className="empty-blogs-message">No blogs found. Create one!</p>
      ) : viewMode === "grid" ? (
        <div className="blog-grid-container">
          {blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <div className="card-header">
                <input
                  type="checkbox"
                  checked={selectedBlogIds.includes(blog._id)}
                  onChange={() => handleSelectBlog(blog._id)}
                  style={{ marginRight: "10px" }}
                />
                {editingBlogId === blog._id ? (
                  <input
                    type="text"
                    name="title"
                    value={editedBlogData.title || ""}
                    onChange={handleEditChange}
                    className="input-field"
                  />
                ) : (
                  <h3 className="card-title">{blog.title}</h3>
                )}
              </div>

              <div className="card-image-container">
                {editingBlogId === blog._id && (
                  <div className="image-edit-controls">
                    {editedBlogData.imageUrl && !selectedImageFile ? (
                      <img
                        src={editedBlogData.imageUrl}
                        alt="Current"
                        className="current-image-thumbnail"
                      />
                    ) : selectedImageFile ? (
                      <img
                        src={URL.createObjectURL(selectedImageFile)}
                        alt="New Selected"
                        className="current-image-thumbnail"
                      />
                    ) : (
                      <img
                        src="https://placehold.co/100x100?text=No+Image"
                        alt="Placeholder"
                        className="current-image-thumbnail"
                      />
                    )}
                    <input
                      type="file"
                      name="profilePic"
                      onChange={handleImageFileChange}
                      ref={fileInputRef}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={handleImageUploadButtonClick}
                      className="btn"
                    >
                      {selectedImageFile
                        ? "Change Selected Image"
                        : "Upload New Image"}
                    </button>
                  </div>
                )}
                {!editingBlogId || editingBlogId !== blog._id
                  ? blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="card-image"
                      />
                    )
                  : null}
              </div>

              <div className="card-body">
                <p>
                  <strong>Author:</strong>{" "}
                  {blog.userId ? blog.userId.fullName : "Unknown User"}
                </p>
                <p className="card-description">
                  <strong>Description:</strong>{" "}
                  {editingBlogId === blog._id ? (
                    <textarea
                      name="description"
                      value={editedBlogData.description || ""}
                      onChange={handleEditChange}
                      className="textarea-field"
                    />
                  ) : (
                    <>
                      {truncateText(blog.description, 150)}{" "}
                      {blog.description && blog.description.length > 150 && (
                        <button
                          onClick={() => handleViewBlog(blog)}
                          className="view-full-btn"
                        >
                          View
                        </button>
                      )}
                    </>
                  )}
                </p>
                {editingBlogId === blog._id ? (
                  <p className="card-description">
                    <strong>More Info:</strong>{" "}
                    <textarea
                      name="moreDescription"
                      value={editedBlogData.moreDescription || ""}
                      onChange={handleEditChange}
                      className="textarea-field"
                    />
                  </p>
                ) : (
                  blog.moreDescription && (
                    <p className="card-description">
                      <strong>More Info:</strong>{" "}
                      {truncateText(blog.moreDescription, 150)}{" "}
                      {blog.moreDescription.length > 150 && (
                        <button
                          onClick={() => handleViewBlog(blog)}
                          className="view-full-btn"
                        >
                          View
                        </button>
                      )}
                    </p>
                  )
                )}
                <p>
                  <strong>Likes:</strong> {blog.likesCount} |{" "}
                  <strong>Dislikes:</strong> {blog.dislikesCount}
                </p>
                <p>
                  <strong>Hashtags:</strong>{" "}
                  {editingBlogId === blog._id ? (
                    <input
                      type="text"
                      name="hashtags"
                      value={editedBlogData.hashtags || ""}
                      onChange={handleEditChange}
                      placeholder="Comma separated"
                      className="input-field"
                    />
                  ) : blog.hashtags && blog.hashtags.length > 0 ? (
                    blog.hashtags.join(", ")
                  ) : (
                    "None"
                  )}
                </p>
              </div>

              <div className="card-actions">
                {editingBlogId === blog._id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(blog._id)}
                      className="btn btn-save"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(blog)}
                      className="btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="blogs-table-container">
          <table className="blogs-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Title</th>
                <th>Author</th>
                <th>Description</th>
                <th>More Description</th>
                <th>Image</th>
                <th>Likes</th>
                <th>Dislikes</th>
                <th>Hashtags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedBlogIds.includes(blog._id)}
                      onChange={() => handleSelectBlog(blog._id)}
                    />
                  </td>
                  <td>
                    {editingBlogId === blog._id ? (
                      <input
                        type="text"
                        name="title"
                        value={editedBlogData.title || ""}
                        onChange={handleEditChange}
                        className="input-field"
                      />
                    ) : (
                      blog.title
                    )}
                  </td>
                  <td>{blog.userId ? blog.userId.fullName : "Unknown User"}</td>
                  <td>
                    {editingBlogId === blog._id ? (
                      <textarea
                        name="description"
                        value={editedBlogData.description || ""}
                        onChange={handleEditChange}
                        className="textarea-field"
                      />
                    ) : (
                      <>
                        {truncateText(blog.description, 100)}{" "}
                        {blog.description && blog.description.length > 100 && (
                          <button
                            onClick={() => handleViewBlog(blog)}
                            className="view-full-btn"
                          >
                            View
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td>
                    {editingBlogId === blog._id ? (
                      <textarea
                        name="moreDescription"
                        value={editedBlogData.moreDescription || ""}
                        onChange={handleEditChange}
                        className="textarea-field"
                      />
                    ) : (
                      <>
                        {truncateText(blog.moreDescription, 100)}{" "}
                        {blog.moreDescription &&
                          blog.moreDescription.length > 100 && (
                            <button
                              onClick={() => handleViewBlog(blog)}
                              className="view-full-btn"
                            >
                              View
                            </button>
                          )}
                      </>
                    )}
                  </td>
                  <td>
                    {editingBlogId === blog._id ? (
                      <div className="image-edit-controls-table">
                        {editedBlogData.imageUrl && !selectedImageFile ? (
                          <img
                            src={editedBlogData.imageUrl}
                            alt="Current"
                            className="current-image-thumbnail"
                          />
                        ) : selectedImageFile ? (
                          <img
                            src={URL.createObjectURL(selectedImageFile)}
                            alt="New Selected"
                            className="current-image-thumbnail"
                          />
                        ) : (
                          <img
                            src="https://placehold.co/80x80?text=No+Image"
                            alt="Placeholder"
                            className="current-image-thumbnail"
                          />
                        )}
                        <input
                          type="file"
                          name="profilePic"
                          onChange={handleImageFileChange}
                          ref={fileInputRef}
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          onClick={handleImageUploadButtonClick}
                          className="btn"
                        >
                          {selectedImageFile ? "Change" : "Upload"}
                        </button>
                      </div>
                    ) : (
                      blog.imageUrl && (
                        <img
                          src={blog.imageUrl}
                          alt={blog.title}
                          style={{
                            maxWidth: "80px",
                            maxHeight: "80px",
                            objectFit: "cover",
                          }}
                        />
                      )
                    )}
                  </td>
                  <td>{blog.likesCount}</td>
                  <td>{blog.dislikesCount}</td>
                  <td>
                    {editingBlogId === blog._id ? (
                      <input
                        type="text"
                        name="hashtags"
                        value={editedBlogData.hashtags || ""}
                        onChange={handleEditChange}
                        placeholder="Comma separated"
                        className="input-field"
                      />
                    ) : blog.hashtags ? (
                      blog.hashtags.join(", ")
                    ) : (
                      "None"
                    )}
                  </td>
                  <td>
                    {editingBlogId === blog._id ? (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => handleSaveEdit(blog._id)}
                          className="btn btn-save"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn btn-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "5px" }}>
                        <button
                          onClick={() => handleEditClick(blog)}
                          className="btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="btn btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h2>Confirm Action</h2>
              <button className="close-button" onClick={handleCancelConfirm}>
                &times;
              </button>
            </div>
            <p className="modal-message">{confirmModalMessage}</p>
            <div className="modal-actions">
              <button className="btn btn-delete" onClick={handleConfirm}>
                Confirm
              </button>
              <button className="btn btn-cancel" onClick={handleCancelConfirm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h2>Notification</h2>
              <button className="close-button" onClick={handleCloseAlert}>
                &times;
              </button>
            </div>
            <p className="modal-message">{alertModalMessage}</p>
            <div className="modal-actions">
              <button className="btn" onClick={handleCloseAlert}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h2>Update Successful</h2>
              <button className="close-button" onClick={handleCloseUpdate}>
                &times;
              </button>
            </div>
            <p className="modal-message">{updateModalMessage}</p>
            <div className="modal-actions">
              <button className="btn btn-save" onClick={handleCloseUpdate}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlogDetailModal && selectedBlogForDetail && (
        <div className="modal-overlay">
          <div className="modal-content blog-detail-modal">
            <div className="modal-header">
              <h2>{selectedBlogForDetail.title}</h2>
              <button
                className="close-button"
                onClick={handleCloseBlogDetailModal}
              >
                &times;
              </button>
            </div>
            <div className="blog-detail-content">
              {selectedBlogForDetail.imageUrl && (
                <img
                  src={selectedBlogForDetail.imageUrl}
                  alt={selectedBlogForDetail.title}
                  className="blog-detail-image"
                />
              )}
              <p>
                <strong>Author:</strong>{" "}
                {selectedBlogForDetail.userId
                  ? selectedBlogForDetail.userId.fullName
                  : "Unknown User"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedBlogForDetail.description}
              </p>
              {selectedBlogForDetail.moreDescription && (
                <p>
                  <strong>More Info:</strong>{" "}
                  {selectedBlogForDetail.moreDescription}
                </p>
              )}
              <p>
                <strong>Likes:</strong> {selectedBlogForDetail.likesCount} |{" "}
                <strong>Dislikes:</strong> {selectedBlogForDetail.dislikesCount}
              </p>
              <p>
                <strong>Hashtags:</strong>{" "}
                {selectedBlogForDetail.hashtags &&
                selectedBlogForDetail.hashtags.length > 0
                  ? selectedBlogForDetail.hashtags.join(", ")
                  : "None"}
              </p>
              <p className="timestamps">
                <strong>Created At:</strong>{" "}
                {new Date(selectedBlogForDetail.createdAt).toLocaleString()}
                <br />
                <strong>Updated At:</strong>{" "}
                {new Date(selectedBlogForDetail.updatedAt).toLocaleString()}
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={handleCloseBlogDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;
