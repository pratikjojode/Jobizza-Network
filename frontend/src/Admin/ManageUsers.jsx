import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ManageUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="manage-users-container">
        <p className="loading-message">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-users-container">
        <p className="error-message">Error: {error}</p>
        <p className="error-message">
          Please ensure you are logged in as an administrator.
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="manage-users-container">
        <p className="no-users-message">No users found.</p>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <h2 className="manage-users-heading">Manage Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Company</th>
            <th>Designation</th>
            <th>LinkedIn</th>
            <th>Financial Certs</th>
            <th>Years Finance Exp.</th>
            <th>Industry Specializations</th>
            <th>Key Financial Skills</th>
            <th>Budget Managed</th>
            <th>Verified</th>
            <th>Approved</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                {user._id
                  ? user._id
                      .toString()
                      .replace("ObjectId('", "")
                      .replace("')", "")
                  : "N/A"}
              </td>
              <td>{user.fullName || "N/A"}</td>
              <td>{user.email}</td>
              <td>{user.role || "N/A"}</td>
              <td>{user.company || "N/A"}</td>
              <td>{user.designation || "N/A"}</td>
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
              <td>
                {user.financialCertifications &&
                user.financialCertifications.length > 0 ? (
                  <details>
                    <summary>
                      View ({user.financialCertifications.length})
                    </summary>
                    <ul>
                      {user.financialCertifications.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  "None"
                )}
              </td>
              <td>{user.yearsOfFinanceExperience || "0"}</td>
              <td>
                {user.industrySpecializations &&
                user.industrySpecializations.length > 0 ? (
                  <details>
                    <summary>
                      View ({user.industrySpecializations.length})
                    </summary>
                    <ul>
                      {user.industrySpecializations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  "None"
                )}
              </td>
              <td>
                {user.keyFinancialSkills &&
                user.keyFinancialSkills.length > 0 ? (
                  <details>
                    <summary>View ({user.keyFinancialSkills.length})</summary>
                    <ul>
                      {user.keyFinancialSkills.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  "None"
                )}
              </td>
              <td>{user.budgetManaged || "N/A"}</td>
              <td>{user.isVerified ? "Yes" : "No"}</td>
              <td>{user.isApproved ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
