import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Assuming you have an AuthContext for logout
import "../styles/UserProfilePage.css"; // Don't forget to create this CSS file if you haven't already!
import ConnectionsHeader from "../components/ConnectionsHeader";

const UserProfilePage = () => {
  const { userId } = useParams(); // Extracts the 'userId' from the URL (e.g., /profile/abc123def456)
  const navigate = useNavigate();
  const { logout } = useAuth(); // Access logout from your AuthContext

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    const headers = getAuthHeaders();

    if (!headers) {
      setError("Please log in to view user profiles.");
      setLoading(false);
      logout(); // Log out if no token is found
      return;
    }

    try {
      const response = await axios.get(`/api/v1/users/${userId}`, {
        headers,
      });
      setUserProfile(response.data.data.user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load user profile.";

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired or unauthorized. Please log in again.");
        logout(); // Log out if session is expired
      } else if (err.response?.status === 404) {
        setError("User profile not found.");
        setUserProfile(null); // Explicitly set to null if not found
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, getAuthHeaders, logout]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    } else {
      setLoading(false);
      setError("No user ID provided in the URL.");
    }
  }, [userId, fetchUserProfile]);

  const userInitial = userProfile?.fullName?.charAt(0)?.toUpperCase() || "?";

  if (loading) {
    return (
      <div className="profile-page-container loading-state">
        <div className="loading-spinner" role="status" aria-live="polite">
          <div className="spinner"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-container error-state">
        <div className="error-message" role="alert">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="profile-page-container not-found-state">
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            🚫
          </div>
          <h3>Profile Not Found</h3>
          <p>
            The user profile you are looking for does not exist or is
            unavailable.
          </p>
          <button
            onClick={() => navigate("/connections")}
            className="btn btn-primary"
          >
            Browse Connections
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConnectionsHeader />
      <div className="profile-page-container">
        <div className="profile-card">
          <div className="profile-header">
            {userProfile.profilePic ? (
              <img
                src={userProfile.profilePic}
                alt={`${userProfile.fullName}'s profile`}
                className="profile-avatar-large"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.target.style.display = "none";
                  if (e.target.nextElementSibling) {
                    e.target.nextElementSibling.style.display = "flex";
                  }
                }}
              />
            ) : (
              <div
                className="profile-avatar-placeholder-large"
                style={{
                  background: "linear-gradient(135deg, #0a66c2, #004d96)",
                  display: userProfile.profilePic ? "none" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  color: "white",
                  fontWeight: "bold",
                }}
                aria-hidden="true"
              >
                {userInitial}
              </div>
            )}
            <h1 className="profile-name">{userProfile.fullName}</h1>
            {userProfile.designation && (
              <p className="profile-designation">{userProfile.designation}</p>
            )}
            {userProfile.company && (
              <p className="profile-company">at {userProfile.company}</p>
            )}
          </div>

          <div className="profile-details-section">
            <h2>About</h2>
            {userProfile.email && (
              <p>
                <strong>Email:</strong> {userProfile.email}
              </p>
            )}
            {userProfile.yearsOfFinanceExperience && (
              <p>
                <strong>Experience:</strong>{" "}
                {userProfile.yearsOfFinanceExperience} years in finance
              </p>
            )}
            {userProfile.budgetManaged && (
              <p>
                <strong>Budget Managed:</strong> {userProfile.budgetManaged}
              </p>
            )}
            {typeof userProfile.isVerified === "boolean" && (
              <p>
                <strong>Verified:</strong>{" "}
                {userProfile.isVerified ? "Yes ✅" : "No ❌"}
              </p>
            )}
          </div>

          {userProfile.financialCertifications?.length > 0 && (
            <div className="profile-details-section">
              <h2>Certifications</h2>
              <p>{userProfile.financialCertifications.join(", ")}</p>
            </div>
          )}

          {userProfile.industrySpecializations?.length > 0 && (
            <div className="profile-details-section">
              <h2>Industry Specializations</h2>
              <p>{userProfile.industrySpecializations.join(", ")}</p>
            </div>
          )}

          {userProfile.keyFinancialSkills?.length > 0 && (
            <div className="profile-details-section">
              <h2>Key Skills</h2>
              <p>{userProfile.keyFinancialSkills.join(", ")}</p>
            </div>
          )}

          {userProfile.linkedin && (
            <div className="profile-details-section">
              <h2>Connect</h2>
              <p>
                <a
                  href={userProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linkedin-link-profile"
                  aria-label={`Visit ${userProfile.fullName}'s LinkedIn profile`}
                >
                  View LinkedIn Profile
                </a>
              </p>
            </div>
          )}

          <div className="profile-actions-footer">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
              Back to Connections
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
