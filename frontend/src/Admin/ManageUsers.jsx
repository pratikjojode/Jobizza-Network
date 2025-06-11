import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/ManageUsers.css";

const DEFAULT_PROFILE_PIC = "../../public/profile-pic-dummy.png";
const ManageUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  // State for the Update Modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    company: "",
    designation: "",
    linkedin: "",
    profilePic: "",
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
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const exportUsersToCsv = () => {
    if (users.length === 0) {
      alert("No users to export.");
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
        formatField((user.financialCertifications || []).join(", ")),
        user.yearsOfFinanceExperience || "0",
        formatField((user.industrySpecializations || []).join(", ")),
        formatField((user.keyFinancialSkills || []).join(", ")),
        formatField((user.connections || []).join(", ")),
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
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
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
        alert("User deleted successfully!");
      } catch (err) {
        setError(err.message);
        console.error("Error deleting user:", err);
        alert(`Error deleting user: ${err.message}`);
      }
    }
  };

  // --- Update Modal Logic ---
  const handleUpdateUser = (user) => {
    setCurrentUserToEdit(user);
    // Initialize form data with all user details
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "",
      company: user.company || "",
      designation: user.designation || "",
      linkedin: user.linkedin || "",
      profilePic: user.profilePic || "",
      financialCertifications: (user.financialCertifications || []).join(", "),
      yearsOfFinanceExperience: user.yearsOfFinanceExperience || "",
      industrySpecializations: (user.industrySpecializations || []).join(", "),
      keyFinancialSkills: (user.keyFinancialSkills || []).join(", "),
      connections: (user.connections || []).join(", "),
      budgetManaged: user.budgetManaged || "",
      isVerified: user.isVerified || false,
      isApproved: user.isApproved || false,
    });
    setShowUpdateModal(true);
    setUpdateError(null);
  };

  const handleModalClose = () => {
    setShowUpdateModal(false);
    setCurrentUserToEdit(null);
    setEditFormData({});
    setUpdateError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!currentUserToEdit || !token) return;

    setUpdateLoading(true);
    setUpdateError(null);

    // Prepare data for API: convert comma-separated strings back to arrays
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
        throw new Error(errorData.message || "Failed to update user.");
      }

      const updatedUser = await response.json();
      setUsers(
        users.map((user) =>
          user._id === updatedUser.data._id ? updatedUser.data : user
        )
      );
      alert("User updated successfully!");
      handleModalClose();
    } catch (err) {
      setUpdateError(err.message);
      console.error("Error saving user:", err);
    } finally {
      setUpdateLoading(false);
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
      <h2 className="manage-users-heading">Manage Users ({users.length})</h2>

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
        <button className="export-csv-btn" onClick={exportUsersToCsv}>
          Export to CSV
        </button>
      </div>

      {viewMode === "table" ? (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
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
                  <td title={user._id}>
                    {user._id ? user._id.slice(-6) : "N/A"}
                  </td>
                  <td>
                    {/* Updated: Use default profile pic if user.profilePic is not available */}
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
                    <span
                      className={`status-badge ${
                        user.isVerified ? "status-yes" : "status-no"
                      }`}
                    >
                      {user.isVerified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.isApproved ? "status-yes" : "status-no"
                      }`}
                    >
                      {user.isApproved ? "Yes" : "No"}
                    </span>
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
              <div className="card-header">
                {/* Updated: Always render img, use default if profilePic is missing */}
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
                  <span
                    className={`status-badge ${
                      user.isVerified ? "status-yes" : "status-no"
                    }`}
                  >
                    {user.isVerified ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <strong>Approved:</strong>{" "}
                  <span
                    className={`status-badge ${
                      user.isApproved ? "status-yes" : "status-no"
                    }`}
                  >
                    {user.isApproved ? "Yes" : "No"}
                  </span>
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
              {/* Personal Info */}
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

              {/* Professional Info */}
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

              {/* Profile Picture */}
              <div className="form-group form-group-full">
                <label htmlFor="profilePic">Profile Picture URL:</label>
                <input
                  type="url"
                  id="profilePic"
                  name="profilePic"
                  value={editFormData.profilePic}
                  onChange={handleChange}
                />
              </div>

              {/* Array Fields */}
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
                  Connections (IDs, comma-separated):
                </label>
                <input
                  type="text"
                  id="connections"
                  name="connections"
                  value={editFormData.connections}
                  onChange={handleChange}
                />
              </div>

              {/* Status Toggles */}
              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="isVerified"
                  name="isVerified"
                  checked={editFormData.isVerified}
                  onChange={handleChange}
                />
                <label htmlFor="isVerified">Verified User</label>
              </div>
              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="isApproved"
                  name="isApproved"
                  checked={editFormData.isApproved}
                  onChange={handleChange}
                />
                <label htmlFor="isApproved">Approved User</label>
              </div>

              {updateLoading && (
                <p className="loading-message">Saving changes...</p>
              )}
              {updateError && (
                <p className="error-message-modal">Error: {updateError}</p>
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={updateLoading}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cancel-button"
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
    </div>
  );
};

export default ManageUsers;
