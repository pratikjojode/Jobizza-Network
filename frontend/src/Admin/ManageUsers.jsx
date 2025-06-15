import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/ManageUsers.css";

const DEFAULT_PROFILE_PIC =
  "https://placehold.co/150x150/aabbcc/ffffff?text=No+Pic";

const ManageUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    company: "",
    designation: "",
    linkedin: "",
    financialCertifications: "",
    yearsOfFinanceExperience: "",
    industrySpecializations: "",
    keyFinancialSkills: "",
    connections: "",
    budgetManaged: "",
    isVerified: false,
    isApproved: false,
  });
  const [updateError, setUpdateError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Modals for confirmation and alerts
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const confirmActionRef = useRef(null); // To store the action to perform on confirmation

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertModalMessage, setAlertModalMessage] = useState("");

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

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/v1/admin/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            setError(
              errorData.message ||
                "You don't have permission to view this page."
            );
          } else {
            throw new Error(errorData.message || "Failed to fetch users.");
          }
        } else {
          const data = await response.json();
          setUsers(data);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching users:", err);
        showAlert(`Error fetching users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const exportUsersToCsv = () => {
    if (users.length === 0) {
      showAlert("No users to export.");
      return;
    }

    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Role",
      "Company",
      "Designation",
      "LinkedIn",
      "Profile Pic URL",
      "Financial Certs",
      "Years Finance Exp",
      "Industry Specializations",
      "Key Financial Skills",
      "Connections",
      "Budget Managed",
      "Verified",
      "Approved",
      "Created At",
      "Last Updated At",
    ];

    const csvRows = users.map((user) => {
      const formatField = (field) => {
        if (
          typeof field === "string" &&
          (field.includes(",") || field.includes('"'))
        ) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };

      return [
        user._id ? user._id.toString() : "",
        formatField(user.fullName || ""),
        formatField(user.email || ""),
        formatField(user.role || ""),
        formatField(user.company || ""),
        formatField(user.designation || ""),
        formatField(user.linkedin || ""),
        formatField(user.profilePic || ""),
        formatField((user.financialCertifications || []).join("; ")),
        user.yearsOfFinanceExperience || "0",
        formatField((user.industrySpecializations || []).join("; ")),
        formatField((user.keyFinancialSkills || []).join("; ")),
        formatField((user.connections || []).join("; ")),
        formatField(user.budgetManaged || ""),
        user.isVerified ? "Yes" : "No",
        user.isApproved ? "Yes" : "No",
        user.createdAt ? new Date(user.createdAt).toLocaleString() : "",
        user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "users_data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    showAlert("Users data exported to CSV!");
  };

  const confirmDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user.");
      }

      setUsers(users.filter((user) => user._id !== userId));
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      showAlert("User deleted successfully!");
    } catch (err) {
      setError(err.message);
      console.error("Error deleting user:", err);
      showAlert(`Error deleting user: ${err.message}`);
    }
  };

  const handleDeleteUser = (userId) => {
    showConfirmation(
      "Are you sure you want to delete this user? This action cannot be undone.",
      () => confirmDeleteUser(userId)
    );
  };

  const confirmBulkDelete = async () => {
    if (selectedUserIds.size === 0) {
      showAlert("Please select users to delete.");
      return;
    }

    setLoading(true);
    let successfulDeletions = 0;
    let failedDeletions = 0;
    const failedUserNames = [];

    for (const userId of selectedUserIds) {
      try {
        const response = await fetch(`/api/v1/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const userToDelete = users.find((u) => u._id === userId);
          const errorData = await response.json();
          failedDeletions++;
          failedUserNames.push(userToDelete?.fullName || userId);
          console.error(
            `Failed to delete user ${userId}:`,
            errorData.message || "Unknown error"
          );
        } else {
          successfulDeletions++;
        }
      } catch (err) {
        const userToDelete = users.find((u) => u._id === userId);
        failedDeletions++;
        failedUserNames.push(userToDelete?.fullName || userId);
        console.error(`Error deleting user ${userId}:`, err);
      }
    }

    if (successfulDeletions > 0) {
      showAlert(`${successfulDeletions} users deleted successfully.`);
    }
    if (failedDeletions > 0) {
      showAlert(
        `${failedDeletions} users failed to delete: ${failedUserNames.join(
          ", "
        )}. Check console for details.`
      );
    }

    setUsers((prevUsers) =>
      prevUsers.filter((user) => !selectedUserIds.has(user._id))
    );
    setSelectedUserIds(new Set());
    setLoading(false);
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.size === 0) {
      showAlert("Please select users to delete.");
      return;
    }
    showConfirmation(
      `Are you sure you want to delete ${selectedUserIds.size} selected users? This action cannot be undone.`,
      confirmBulkDelete
    );
  };

  const toggleUserStatus = async (userId, field, currentValue) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === undefined) {
          const rawError = await response.text();
          console.error("Raw server response:", rawError);
          throw new Error(
            rawError || "Server returned an unexpected response format."
          );
        }
        throw new Error(errorData.message || `Failed to toggle ${field}.`);
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? updatedUser.data : user))
      );
      showAlert(
        `${field} status updated successfully for ${updatedUser.data.fullName}!`
      );
    } catch (err) {
      setError(err.message);
      console.error(`Error toggling ${field} status:`, err);
      showAlert(`Error toggling ${field} status: ${err.message}`);
    }
  };

  const handleUpdateUser = (user) => {
    setCurrentUserToEdit(user);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "",
      company: user.company || "",
      designation: user.designation || "",
      linkedin: user.linkedin || "",
      financialCertifications: (user.financialCertifications || []).join(", "),
      yearsOfFinanceExperience: user.yearsOfFinanceExperience || "",
      industrySpecializations: (user.industrySpecializations || []).join(", "),
      keyFinancialSkills: (user.keyFinancialSkills || []).join(", "),
      connections: (user.connections || []).join(", "),
      budgetManaged: user.budgetManaged || "",
      isVerified: user.isVerified || false,
      isApproved: user.isApproved || false,
    });
    setProfileImageFile(null);
    setShowUpdateModal(true);
    setUpdateError(null);
  };

  const handleModalClose = () => {
    setShowUpdateModal(false);
    setCurrentUserToEdit(null);
    setEditFormData({});
    setUpdateError(null);
    setProfileImageFile(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setProfileImageFile(e.target.files[0]);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!currentUserToEdit || !token) return;

    setUpdateLoading(true);
    setUpdateError(null);

    let updatedUserResult = null;

    const dataToSend = {
      ...editFormData,
      financialCertifications: editFormData.financialCertifications
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      industrySpecializations: editFormData.industrySpecializations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      keyFinancialSkills: editFormData.keyFinancialSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      connections: editFormData.connections
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      yearsOfFinanceExperience:
        Number(editFormData.yearsOfFinanceExperience) || 0,
    };

    try {
      const response = await fetch(
        `/api/v1/admin/users/${currentUserToEdit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user details.");
      }
      updatedUserResult = await response.json();
    } catch (err) {
      setUpdateError(`Error saving user details: ${err.message}`);
      console.error("Error saving user details:", err);
      setUpdateLoading(false);
      return;
    }

    if (profileImageFile) {
      const formData = new FormData();
      formData.append("profilePic", profileImageFile);

      try {
        const uploadResponse = await fetch(
          `/api/v1/admin/users/${currentUserToEdit._id}/profile-pic`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            errorData.message || "Failed to upload profile picture."
          );
        }
        const uploadedImageData = await uploadResponse.json();
        updatedUserResult.data.profilePic = uploadedImageData.profilePicUrl;
      } catch (err) {
        setUpdateError((prev) =>
          prev
            ? `${prev} And: ${err.message}`
            : `Error uploading profile picture: ${err.message}`
        );
        console.error("Error uploading profile picture:", err);
      }
    }

    if (updatedUserResult) {
      setUsers(
        users.map((user) =>
          user._id === updatedUserResult.data._id
            ? updatedUserResult.data
            : user
        )
      );
      showAlert("User updated successfully!");
      handleModalClose();
    } else {
      showAlert("User details updated, but no data was returned.");
    }

    setUpdateLoading(false);
  };

  const handleSelectUser = (userId) => {
    setSelectedUserIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return newSelected;
    });
  };

  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      const allUserIds = new Set(users.map((user) => user._id));
      setSelectedUserIds(allUserIds);
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const renderCollapsibleList = (items, name) => {
    if (items && items.length > 0) {
      return (
        <details>
          <summary>
            View {name} ({items.length})
          </summary>
          <ul>
            {items.map((item, idx) => (
              <li key={idx}>{item.toString()}</li>
            ))}
          </ul>
        </details>
      );
    }
    return "None";
  };

  if (loading)
    return (
      <div className="manage-users-container">
        <p className="loading-message">Loading users...</p>
      </div>
    );
  if (error)
    return (
      <div className="manage-users-container">
        <p className="error-message">Error: {error}</p>
        <p className="error-message">
          Please ensure you are logged in as an administrator.
        </p>
      </div>
    );
  if (users.length === 0)
    return (
      <div className="manage-users-container">
        <p className="no-users-message">No users found.</p>
      </div>
    );

  return (
    <div className="manage-users-container">
      <div className="manage-users-controls">
        <div className="view-toggle-buttons">
          <button
            className={`view-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
          >
            Table View
          </button>
          <button
            className={`view-btn ${viewMode === "card" ? "active" : ""}`}
            onClick={() => setViewMode("card")}
          >
            Card View
          </button>
        </div>
        <div className="action-buttons">
          <button className="export-csv-btn" onClick={exportUsersToCsv}>
            Export to CSV
          </button>
          <button
            className="delete-selected-btn"
            onClick={handleBulkDelete}
            disabled={selectedUserIds.size === 0 || loading}
          >
            Delete Selected ({selectedUserIds.size})
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAllUsers}
                    checked={
                      selectedUserIds.size === users.length && users.length > 0
                    }
                    disabled={users.length === 0}
                  />
                </th>{" "}
                <th>ID</th>
                <th>Profile</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company & Designation</th>
                <th>LinkedIn</th>
                <th>Years Exp.</th>
                <th>Budget Managed</th>
                <th>Financial Certs</th>
                <th>Industry Specializations</th>
                <th>Key Financial Skills</th>
                <th>Connections</th>
                <th>Verified</th>
                <th>Approved</th>
                <th>Timestamps</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>{" "}
                  <td title={user._id}>
                    {user._id ? user._id.slice(-6) : "N/A"}
                  </td>
                  <td>
                    <img
                      src={user.profilePic || DEFAULT_PROFILE_PIC}
                      alt="Profile"
                      className="table-profile-pic"
                    />
                  </td>
                  <td>{user.fullName || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>{user.role || "N/A"}</td>
                  <td>
                    <strong>{user.company || "N/A"}</strong>
                    <br />
                    {user.designation || "N/A"}
                  </td>
                  <td>
                    {user.linkedin ? (
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Profile
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{user.yearsOfFinanceExperience || "0"}</td>
                  <td>{user.budgetManaged || "N/A"}</td>
                  <td>
                    {renderCollapsibleList(
                      user.financialCertifications,
                      "Certs"
                    )}
                  </td>
                  <td>
                    {renderCollapsibleList(
                      user.industrySpecializations,
                      "Specs"
                    )}
                  </td>
                  <td>
                    {renderCollapsibleList(user.keyFinancialSkills, "Skills")}
                  </td>
                  <td>
                    {renderCollapsibleList(user.connections, "Connections")}
                  </td>
                  <td>
                    <button
                      className={`status-badge ${
                        user.isVerified ? "status-yes" : "status-no"
                      }`}
                      onClick={() =>
                        toggleUserStatus(
                          user._id,
                          "isVerified",
                          user.isVerified
                        )
                      }
                    >
                      {user.isVerified ? "Verified" : "Unverified"}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`status-badge ${
                        user.isApproved ? "status-yes" : "status-no"
                      }`}
                      onClick={() =>
                        toggleUserStatus(
                          user._id,
                          "isApproved",
                          user.isApproved
                        )
                      }
                    >
                      {user.isApproved ? "Approved" : "Unapproved"}
                    </button>
                  </td>
                  <td>
                    <strong>Created:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                    <br />
                    <strong>Updated:</strong>{" "}
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="user-actions">
                    <button
                      className="action-btn update-btn"
                      onClick={() => handleUpdateUser(user)}
                    >
                      Update
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="user-cards-grid">
          {users.map((user) => (
            <div key={user._id} className="user-card">
              <div className="card-selection">
                <input
                  type="checkbox"
                  checked={selectedUserIds.has(user._id)}
                  onChange={() => handleSelectUser(user._id)}
                />
              </div>
              <div className="card-header">
                <img
                  src={user.profilePic || DEFAULT_PROFILE_PIC}
                  alt="Profile"
                  className="card-profile-pic"
                />
                <div className="card-header-text">
                  <h3>{user.fullName || "N/A"}</h3>
                  <p>
                    {user.designation} at {user.company}
                  </p>
                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role || "N/A"}
              </p>
              <p>
                <strong>Years of Exp:</strong>{" "}
                {user.yearsOfFinanceExperience || "0"} |{" "}
                <strong>Budget:</strong> {user.budgetManaged || "N/A"}
              </p>
              <div className="card-status-container">
                <p>
                  <strong>Verified:</strong>{" "}
                  <button
                    className={`status-badge ${
                      user.isVerified ? "status-yes" : "status-no"
                    }`}
                    onClick={() =>
                      toggleUserStatus(user._id, "isVerified", user.isVerified)
                    }
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </button>
                </p>
                <p>
                  <strong>Approved:</strong>{" "}
                  <button
                    className={`status-badge ${
                      user.isApproved ? "status-yes" : "status-no"
                    }`}
                    onClick={() =>
                      toggleUserStatus(user._id, "isApproved", user.isApproved)
                    }
                  >
                    {user.isApproved ? "Approved" : "Unapproved"}
                  </button>
                </p>
              </div>

              {renderCollapsibleList(
                user.financialCertifications,
                "Financial Certs"
              )}
              {renderCollapsibleList(
                user.industrySpecializations,
                "Industry Specializations"
              )}
              {renderCollapsibleList(
                user.keyFinancialSkills,
                "Key Financial Skills"
              )}
              {renderCollapsibleList(user.connections, "Connections")}

              <p className="timestamps">
                Created: {new Date(user.createdAt).toLocaleString()} | Updated:{" "}
                {new Date(user.updatedAt).toLocaleString()}
              </p>

              <div className="card-actions">
                <button
                  className="action-btn update-btn"
                  onClick={() => handleUpdateUser(user)}
                >
                  Update
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpdateModal && currentUserToEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User: {currentUserToEdit.fullName}</h2>
              <button className="close-button" onClick={handleModalClose}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="update-user-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={editFormData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleChange}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  name="role"
                  value={editFormData.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="CXO">CXO</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="linkedin">LinkedIn Profile URL:</label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={editFormData.linkedin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company:</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={editFormData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="designation">Designation:</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={editFormData.designation}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="yearsOfFinanceExperience">
                  Years of Finance Experience:
                </label>
                <input
                  type="number"
                  id="yearsOfFinanceExperience"
                  name="yearsOfFinanceExperience"
                  value={editFormData.yearsOfFinanceExperience}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="budgetManaged">Budget Managed:</label>
                <input
                  type="text"
                  id="budgetManaged"
                  name="budgetManaged"
                  value={editFormData.budgetManaged}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="profilePicUpload">
                  Upload New Profile Picture:
                </label>
                <input
                  type="file"
                  id="profilePicUpload"
                  name="profilePicUpload"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {currentUserToEdit.profilePic && (
                  <div className="current-profile-pic-preview">
                    <p>Current Picture:</p>
                    <img
                      src={currentUserToEdit.profilePic}
                      alt="Current Profile"
                      className="profile-pic-preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PROFILE_PIC;
                      }}
                    />
                  </div>
                )}
                {profileImageFile && (
                  <div className="selected-file-preview">
                    <p>Selected New Picture:</p>
                    <img
                      src={URL.createObjectURL(profileImageFile)}
                      alt="Selected File"
                      className="profile-pic-preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="financialCertifications">
                  Financial Certifications (comma-separated):
                </label>
                <input
                  type="text"
                  id="financialCertifications"
                  name="financialCertifications"
                  value={editFormData.financialCertifications}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group form-group-full">
                <label htmlFor="industrySpecializations">
                  Industry Specializations (comma-separated):
                </label>
                <input
                  type="text"
                  id="industrySpecializations"
                  name="industrySpecializations"
                  value={editFormData.industrySpecializations}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group form-group-full">
                <label htmlFor="keyFinancialSkills">
                  Key Financial Skills (comma-separated):
                </label>
                <input
                  type="text"
                  id="keyFinancialSkills"
                  name="keyFinancialSkills"
                  value={editFormData.keyFinancialSkills}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group form-group-full">
                <label htmlFor="connections">
                  Connections (comma-separated IDs):
                </label>
                <input
                  type="text"
                  id="connections"
                  name="connections"
                  value={editFormData.connections}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isVerified"
                  name="isVerified"
                  checked={editFormData.isVerified}
                  onChange={handleChange}
                />
                <label htmlFor="isVerified">Is Verified</label>
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isApproved"
                  name="isApproved"
                  checked={editFormData.isApproved}
                  onChange={handleChange}
                />
                <label htmlFor="isApproved">Is Approved</label>
              </div>

              {updateError && <p className="modal-error">{updateError}</p>}
              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-save"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={handleModalClose}
                  disabled={updateLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
    </div>
  );
};

export default ManageUsers;
