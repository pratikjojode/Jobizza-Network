import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/UserProfilePage.css";
import ConnectionsHeader from "../components/ConnectionsHeader";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

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
      logout();
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
        logout();
      } else if (err.response?.status === 404) {
        setError("User profile not found.");
        setUserProfile(null);
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
            <h2 className="section-title">About</h2>
            {userProfile.email && (
              <p className="profile-detail-item">
                <strong className="detail-label">Email:</strong>{" "}
                <span className="detail-value">{userProfile.email}</span>
              </p>
            )}
            {userProfile.yearsOfFinanceExperience && (
              <p className="profile-detail-item">
                <strong className="detail-label">Experience:</strong>{" "}
                <span className="detail-value">
                  {userProfile.yearsOfFinanceExperience} years in finance
                </span>
              </p>
            )}
            {userProfile.budgetManaged && (
              <p className="profile-detail-item">
                <strong className="detail-label">Budget Managed:</strong>{" "}
                <span className="detail-value">
                  {userProfile.budgetManaged}
                </span>
              </p>
            )}
            {typeof userProfile.isVerified === "boolean" && (
              <p className="profile-detail-item">
                <strong className="detail-label">Verified:</strong>{" "}
                <span className="detail-value">
                  {userProfile.isVerified ? "Yes ✅" : "No ❌"}
                </span>
              </p>
            )}
          </div>

          {userProfile.financialCertifications?.length > 0 && (
            <div className="profile-details-section">
              <h2 className="section-title">Certifications</h2>
              <p className="profile-detail-list">
                {userProfile.financialCertifications.join(", ")}
              </p>
            </div>
          )}

          {userProfile.industrySpecializations?.length > 0 && (
            <div className="profile-details-section">
              <h2 className="section-title">Industry Specializations</h2>
              <p className="profile-detail-list">
                {userProfile.industrySpecializations.join(", ")}
              </p>
            </div>
          )}

          {userProfile.keyFinancialSkills?.length > 0 && (
            <div className="profile-details-section">
              <h2 className="section-title">Key Skills</h2>
              <p className="profile-detail-list">
                {userProfile.keyFinancialSkills.join(", ")}
              </p>
            </div>
          )}

          {userProfile.linkedin && (
            <div className="profile-details-section">
              <h2 className="section-title">Connect</h2>
              <p className="profile-linkedin-link-wrapper">
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
