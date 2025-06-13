import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Import toast for notifications
import { useAuth } from "../context/AuthContext"; // Adjusted path to '../context/AuthContext'
import ConnectionsHeader from "../components/ConnectionsHeader"; // Adjusted path to '../components/ConnectionsHeader'
import Footer from "../components/Footer"; // Import your Footer component (adjusted path)
import "../styles/UserProfilePage.css"; // Adjusted path to '../styles/UserProfilePage.css'
import {
  FaLinkedin,
  FaEnvelope,
  FaBriefcase,
  FaBuilding,
  FaUser,
  FaInfoCircle,
  FaCalendarAlt,
  FaMapMarkerAlt, // For location
  FaPhone, // For phone number
  FaUsers, // For mutual connections
  FaGraduationCap, // For certifications
  FaIndustry, // For specializations
  FaLightbulb, // For key skills
  FaCheckCircle, // For verified status
  FaTimesCircle // For unverified status
} from "react-icons/fa"; // Icons for profile details

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(null);
  const [isSelfProfile, setIsSelfProfile] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("not_connected"); // Added connection status state
  const [connectionActionLoading, setConnectionActionLoading] = useState(false); // Loading state for connection actions

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUserProfile(null); // Clear previous profile data

    const headers = getAuthHeaders();
    if (!headers) {
      toast.error("Please log in to view user profiles.");
      setLoading(false);
      logout();
      return null;
    }

    if (!userId) {
      setLoading(false);
      setError("No user ID provided in the URL.");
      return null;
    }

    try {
      const profileResponse = await axios.get(`/api/v1/users/${userId}`, {
        headers,
      });
      const profileData = profileResponse.data.data.user;
      setUserProfile(profileData);

      // Set connection status from backend data if available, otherwise default
      setConnectionStatus(profileData.connectionStatus || "not_connected");

      // Check if this is the current user's profile
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const currentUserId = decodedToken.id; // Assuming 'id' is the user ID field in your JWT payload
          setIsSelfProfile(currentUserId === userId);
        } catch (decodeError) {
          console.error("Error decoding token for self-profile check:", decodeError);
          setIsSelfProfile(false);
        }
      } else {
        setIsSelfProfile(false);
      }

      setLoading(false);
      return profileData;
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
      setLoading(false);
      return null;
    }
  }, [userId, getAuthHeaders, logout]);

  const fetchUserBlogs = useCallback(async () => {
    setBlogsLoading(true);
    setBlogsError(null);
    const headers = getAuthHeaders();

    if (!headers) {
      setBlogsError("Authentication required to load blogs.");
      setBlogsLoading(false);
      return;
    }

    if (!userId) {
      setBlogsError("No user ID provided to fetch blogs.");
      setBlogsLoading(false);
      return;
    }

    try {
      const blogsResponse = await axios.get(`/api/v1/users/${userId}/blogs`, {
        headers,
      });
      setUserBlogs(blogsResponse.data.data.blogs || []);
    } catch (err) {
      console.error("Error fetching user blogs:", err);
      if (err.response?.status === 404) {
        setUserBlogs([]);
        setBlogsError("No blogs found for this user.");
      } else {
        setBlogsError(
          err.response?.data?.message || "Failed to load user blogs."
        );
      }
      setUserBlogs([]);
    } finally {
      setBlogsLoading(false);
    }
  }, [userId, getAuthHeaders]);

  useEffect(() => {
    fetchUserProfile().then((profile) => {
      if (profile) {
        fetchUserBlogs();
      }
    });
  }, [fetchUserProfile, fetchUserBlogs]);

  // Handle connection actions (connect, accept, remove, cancel, decline)
  const handleConnectionAction = useCallback(async (action) => {
    setConnectionActionLoading(true);
    const headers = getAuthHeaders();
    if (!headers) {
      toast.error("Please log in to perform connection actions.");
      setConnectionActionLoading(false);
      return;
    }

    try {
      let message;
      // You'll need to adapt these API calls based on your backend logic
      // Ensure your backend provides the connection ID for operations like accept, decline, remove, cancel
      switch (action) {
        case "connect":
          await axios.post("/api/v1/connections", { receiverId: userId }, { headers });
          message = "Connection request sent!";
          setConnectionStatus("pending_sent");
          break;
        case "accept":
          // Assuming the backend has a way to identify the request by receiverId or senderId
          await axios.put(`/api/v1/connections/${userId}/accept`, {}, { headers });
          message = "Connection request accepted!";
          setConnectionStatus("connected");
          break;
        case "decline":
          await axios.put(`/api/v1/connections/${userId}/decline`, {}, { headers });
          message = "Connection request declined.";
          setConnectionStatus("not_connected");
          break;
        case "cancel":
          await axios.delete(`/api/v1/connections/${userId}/cancel`, { headers }); // Assuming API to cancel request by receiverId
          message = "Connection request cancelled.";
          setConnectionStatus("not_connected");
          break;
        case "remove":
          await axios.delete(`/api/v1/connections/${userId}/remove`, { headers }); // Assuming API to remove connection by target user ID
          message = "Connection removed.";
          setConnectionStatus("not_connected");
          break;
        default:
          console.warn("Unknown connection action:", action);
          return;
      }
      toast.success(message);
    } catch (error) {
      console.error("Error performing connection action:", error);
      const errorMessage = error.response?.data?.message || `Failed to perform ${action} action.`;
      toast.error(errorMessage);
    } finally {
      setConnectionActionLoading(false);
    }
  }, [userId, getAuthHeaders]);


  const userInitial = userProfile?.fullName?.charAt(0)?.toUpperCase() || "?";

  const handleBlogClick = useCallback(
    (blogId) => {
      navigate(`/blogs/${blogId}`);
    },
    [navigate]
  );

  // Render components based on loading/error/empty states
  if (loading) {
    return (
      <>
        <ConnectionsHeader />
        <div className="profile-page-container loading-state">
          <div className="loading-spinner" role="status" aria-live="polite">
            <div className="spinner"></div>
            <p>Loading user profile and content...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ConnectionsHeader />
        <div className="profile-page-container error-state">
          <div className="error-message" role="alert">
            <h2>Error Loading Profile</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-back">
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!userProfile) {
    // This state is typically handled by 'error' if profile fetching failed,
    // but added for robustness if 'userProfile' becomes null unexpectedly.
    return (
      <>
        <ConnectionsHeader />
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
        <Footer />
      </>
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
                // The inline style for background gradient should be moved to CSS for consistency
                // and the display property is handled by CSS classes for visibility
                aria-hidden="true"
              >
                {userInitial}
              </div>
            )}
            <h1 className="profile-name">{userProfile.fullName}</h1>
            {userProfile.designation && userProfile.company && (
              <p className="profile-detail-item">
                <FaBriefcase className="profile-icon" /> {userProfile.designation} at <FaBuilding className="profile-icon" /> {userProfile.company}
              </p>
            )}
            {userProfile.location && (
              <p className="profile-detail-item">
                <FaMapMarkerAlt className="profile-icon" /> {userProfile.location}
              </p>
            )}
          </div>

          {!isSelfProfile && (
            <div className="profile-actions">
              {connectionStatus === "not_connected" && (
                <button onClick={() => handleConnectionAction("connect")} className="btn btn-primary" disabled={connectionActionLoading}>
                  {connectionActionLoading ? "Sending..." : "Connect"}
                </button>
              )}
              {connectionStatus === "pending_sent" && (
                <>
                  <button className="btn btn-secondary" disabled>Request Sent</button>
                  <button onClick={() => handleConnectionAction("cancel")} className="btn btn-danger" disabled={connectionActionLoading}>
                    {connectionActionLoading ? "Cancelling..." : "Cancel Request"}
                  </button>
                </>
              )}
              {connectionStatus === "pending_received" && (
                <>
                  <button onClick={() => handleConnectionAction("accept")} className="btn btn-primary" disabled={connectionActionLoading}>
                    {connectionActionLoading ? "Accepting..." : "Accept Request"}
                  </button>
                  <button onClick={() => handleConnectionAction("decline")} className="btn btn-danger" disabled={connectionActionLoading}>
                    {connectionActionLoading ? "Declining..." : "Decline"}
                  </button>
                </>
              )}
              {connectionStatus === "connected" && (
                <>
                  <button className="btn btn-success" disabled>Connected ✔️</button>
                  <button onClick={() => handleConnectionAction("remove")} className="btn btn-danger" disabled={connectionActionLoading}>
                    {connectionActionLoading ? "Removing..." : "Remove Connection"}
                  </button>
                </>
              )}
              <button onClick={() => toast.info("Messaging functionality coming soon!")} className="btn btn-outline" disabled={connectionActionLoading}>
                <FaEnvelope /> Message
              </button>
            </div>
          )}

          <div className="profile-details-section">
            <h2 className="section-title"><FaInfoCircle className="section-icon" /> About</h2>
            <p className="profile-bio">
              {userProfile.bio || "No bio available."}
            </p>
            {userProfile.email && (
              <p className="profile-detail-item">
                <strong className="detail-label"><FaEnvelope className="profile-icon" /> Email:</strong>{" "}
                <span className="detail-value"><a href={`mailto:${userProfile.email}`}>{userProfile.email}</a></span>
              </p>
            )}
            {userProfile.phone && (
              <p className="profile-detail-item">
                <strong className="detail-label"><FaPhone className="profile-icon" /> Phone:</strong>{" "}
                <span className="detail-value">{userProfile.phone}</span>
              </p>
            )}
            {userProfile.yearsOfFinanceExperience && (
              <p className="profile-detail-item">
                <strong className="detail-label"><FaBriefcase className="profile-icon" /> Experience:</strong>{" "}
                <span className="detail-value">
                  {userProfile.yearsOfFinanceExperience} years in finance
                </span>
              </p>
            )}
            {userProfile.budgetManaged && (
              <p className="profile-detail-item">
                <strong className="detail-label"><FaBuilding className="profile-icon" /> Budget Managed:</strong>{" "}
                <span className="detail-value">
                  {userProfile.budgetManaged}
                </span>
              </p>
            )}
            {typeof userProfile.isVerified === "boolean" && (
              <p className="profile-detail-item">
                <strong className="detail-label">
                  {userProfile.isVerified ? <FaCheckCircle className="profile-icon verified-icon" /> : <FaTimesCircle className="profile-icon unverified-icon" />} Verified:
                </strong>{" "}
                <span className="detail-value">
                  {userProfile.isVerified ? "Yes" : "No"}
                </span>
              </p>
            )}
          </div>

          {userProfile.financialCertifications?.length > 0 && (
            <div className="profile-details-section">
              <h2 className="section-title"><FaGraduationCap className="section-icon" /> Certifications</h2>
              <ul className="profile-detail-list">
                {userProfile.financialCertifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {userProfile.industrySpecializations?.length > 0 && (
            <div className="profile-details-section">
              <h2 className="section-title"><FaIndustry className="section-icon" /> Industry Specializations</h2>
              <ul className="profile-detail-list">
                {userProfile.industrySpecializations.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </div>
          )}

          {userProfile.keyFinancialSkills?.length > 0 && (
            <div className="profile-details-section">
              <h2 className="section-title"><FaLightbulb className="section-icon" /> Key Skills</h2>
              <ul className="profile-detail-list skills-list">
                {userProfile.keyFinancialSkills.map((skill, index) => (
                  <li key={index} className="skill-tag">{skill}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="profile-details-section">
            <h2 className="section-title"><FaCalendarAlt className="section-icon" /> Blogs & Articles</h2>
            {blogsLoading ? (
              <p className="loading-blogs-message">Loading blogs...</p>
            ) : blogsError ? (
              <p className="error-blogs-message">{blogsError}</p>
            ) : userBlogs.length > 0 ? (
              <div className="user-blogs-list">
                {userBlogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="blog-item"
                    onClick={() => handleBlogClick(blog._id)}
                    tabIndex="0" // Make clickable with keyboard
                    role="link" // Indicate it's a link
                  >
                    {blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="blog-item-image"
                      />
                    )}
                    <div className="blog-item-content">
                      <h3 className="blog-title">{blog.title}</h3>
                      {blog.description && (
                        <p className="blog-snippet">{blog.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-blogs-message">
                <p>This user has no public blogs or articles yet.</p>
              </div>
            )}
          </div>

          {userProfile.linkedin && (
            <div className="profile-details-section">
              <p className="profile-linkedin-link-wrapper">
                <a
                  href={userProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linkedin-link-profile"
                  aria-label={`Visit ${userProfile.fullName}'s LinkedIn profile`}
                >
                  <FaLinkedin /> View LinkedIn Profile
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
      <Footer />
    </>
  );
};

export default UserProfilePage;
