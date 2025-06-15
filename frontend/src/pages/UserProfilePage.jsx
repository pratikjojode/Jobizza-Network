import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import ConnectionsHeader from "../components/ConnectionsHeader";
import Footer from "../components/Footer";
import "../styles/UserProfilePage.css";
import {
  FaLinkedin,
  FaEnvelope,
  FaBriefcase,
  FaBuilding,
  FaInfoCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaGraduationCap,
  FaIndustry,
  FaLightbulb,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaRegNewspaper,
} from "react-icons/fa";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [peopleYouMayKnow, setPeopleYouMayKnow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connectionsError, setConnectionsError] = useState(null);
  const [isSelfProfile, setIsSelfProfile] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("not_connected");
  const [connectionActionLoading, setConnectionActionLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUserProfile(null);

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

      // Set connection status from the API response
      setConnectionStatus(profileData.connectionStatus || "not_connected");

      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          const currentUserId = decodedToken.id;
          setIsSelfProfile(currentUserId === userId);
        } catch (decodeError) {
          console.error(
            "Error decoding token for self-profile check:",
            decodeError
          );
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

  const fetchUserEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    const headers = getAuthHeaders();

    if (!headers) {
      setEventsError("Authentication required to load events.");
      setEventsLoading(false);
      return;
    }

    if (!userId) {
      setEventsError("No user ID provided to fetch events.");
      setEventsLoading(false);
      return;
    }

    try {
      const eventsResponse = await axios.get(`/api/v1/users/user/${userId}`, {
        headers,
      });
      setUserEvents(eventsResponse.data.data.events || []);
    } catch (err) {
      console.error("Error fetching user events:", err);
      if (err.response?.status === 404) {
        setUserEvents([]);
        setEventsError("No events found for this user.");
      } else {
        setEventsError(
          err.response?.data?.message || "Failed to load user events."
        );
      }
      setUserEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [userId, getAuthHeaders]);

  const fetchPeopleYouMayKnow = useCallback(async () => {
    setConnectionsLoading(true);
    setConnectionsError(null);
    const headers = getAuthHeaders();

    if (!headers) {
      setConnectionsError("Authentication required to load suggestions.");
      setConnectionsLoading(false);
      return;
    }

    try {
      const connectionsResponse = await axios.get(
        `/api/v1/connections/suggestions`,
        {
          headers,
        }
      );
      setPeopleYouMayKnow(connectionsResponse.data.data.suggestions || []);
    } catch (err) {
      console.error("Error fetching connection suggestions:", err);
      setConnectionsError(
        err.response?.data?.message || "Failed to load connection suggestions."
      );
      setPeopleYouMayKnow([]);
    } finally {
      setConnectionsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchUserProfile().then((profile) => {
      if (profile) {
        fetchUserBlogs();
        fetchUserEvents();
        fetchPeopleYouMayKnow();
      }
    });
  }, [
    fetchUserProfile,
    fetchUserBlogs,
    fetchUserEvents,
    fetchPeopleYouMayKnow,
  ]);

  const handleConnectionAction = useCallback(
    async (action, targetUserId = userId) => {
      setConnectionActionLoading(true);
      const headers = getAuthHeaders();
      if (!headers) {
        toast.error("Please log in to perform connection actions.");
        setConnectionActionLoading(false);
        return;
      }

      try {
        let message;
        let success = false;
        let newStatus = connectionStatus;

        switch (action) {
          case "connect":
            await axios.post(
              "/api/v1/connections",
              { receiverId: targetUserId },
              { headers }
            );
            message = "Connection request sent!";
            success = true;
            newStatus = "pending_sent";
            break;
          case "accept":
            await axios.put(
              `/api/v1/connections/${targetUserId}/accept`,
              {},
              { headers }
            );
            message = "Connection request accepted!";
            success = true;
            newStatus = "connected";
            break;
          case "decline":
            await axios.put(
              `/api/v1/connections/${targetUserId}/decline`,
              {},
              { headers }
            );
            message = "Connection request declined.";
            success = true;
            newStatus = "not_connected";
            break;
          case "cancel":
            await axios.delete(`/api/v1/connections/${targetUserId}/cancel`, {
              headers,
            });
            message = "Connection request cancelled.";
            success = true;
            newStatus = "not_connected";
            break;
          case "remove":
            await axios.delete(`/api/v1/connections/${targetUserId}/remove`, {
              headers,
            });
            message = "Connection removed.";
            success = true;
            newStatus = "not_connected";
            break;
          default:
            console.warn("Unknown connection action:", action);
            return;
        }

        toast.success(message);

        // Update connection status only for the main profile user
        if (targetUserId === userId) {
          setConnectionStatus(newStatus);
        }

        // Refresh connection suggestions if action was successful
        if (success) {
          fetchPeopleYouMayKnow();
        }
      } catch (error) {
        console.error("Error performing connection action:", error);
        const errorMessage =
          error.response?.data?.message ||
          `Failed to perform ${action} action.`;
        toast.error(errorMessage);
      } finally {
        setConnectionActionLoading(false);
      }
    },
    [userId, getAuthHeaders, fetchPeopleYouMayKnow, connectionStatus]
  );

  const userInitial = userProfile?.fullName?.charAt(0)?.toUpperCase() || "?";

  const handleBlogClick = useCallback(
    (blogId) => {
      navigate(`/blogs/${blogId}`);
    },
    [navigate]
  );

  const handleEventClick = useCallback(
    (eventId) => {
      navigate(`/events/${eventId}`);
    },
    [navigate]
  );

  const renderConnectionButtons = () => {
    if (isSelfProfile) {
      return (
        <button
          onClick={() => navigate("/profile/edit")}
          className="button-primary"
        >
          Edit Profile
        </button>
      );
    }

    switch (connectionStatus) {
      case "connected":
        return (
          <button
            onClick={() => handleConnectionAction("remove")}
            className="button-danger"
            disabled={connectionActionLoading}
          >
            Remove Connection
          </button>
        );
      case "pending_sent":
        return (
          <button
            onClick={() => handleConnectionAction("cancel")}
            className="button-secondary"
            disabled={connectionActionLoading}
          >
            Cancel Request
          </button>
        );
      case "pending_received":
        return (
          <div className="connection-actions">
            <button
              onClick={() => handleConnectionAction("accept")}
              className="button-success"
              disabled={connectionActionLoading}
            >
              Accept
            </button>
            <button
              onClick={() => handleConnectionAction("decline")}
              className="button-secondary"
              disabled={connectionActionLoading}
            >
              Decline
            </button>
          </div>
        );
      default:
        return (
          <button
            onClick={() => handleConnectionAction("connect")}
            className="button-primary"
            disabled={connectionActionLoading}
          >
            Connect
          </button>
        );
    }
  };

  if (loading) {
    return (
      <>
        <ConnectionsHeader />
        <div className="profile-page-container loading-state">
          <div className="loading-spinner" role="status" aria-live="polite">
            <div className="spinner-display"></div>
            <p className="loading-text">Loading user profile and content...</p>
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
          <div className="error-display" role="alert">
            <h2 className="error-title">Error Loading Profile</h2>
            <p className="error-message-text">{error}</p>
            <button onClick={() => navigate(-1)} className="button-back">
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!userProfile) {
    return (
      <>
        <ConnectionsHeader />
        <div className="profile-page-container not-found-state">
          <div className="empty-display">
            <div className="empty-icon" aria-hidden="true">
              🚫
            </div>
            <h3 className="empty-title">Profile Not Found</h3>
            <p className="empty-message">
              The user profile you are looking for does not exist or is
              unavailable.
            </p>
            <button
              onClick={() => navigate("/connections")}
              className="button-primary"
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
        <div className="profile-main-content-area">
          <div className="profile-main-card">
            <div className="profile-header-section">
              {userProfile.profilePic ? (
                <img
                  src={userProfile.profilePic}
                  alt={`${userProfile.fullName}'s profile`}
                  className="profile-avatar-display"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = "flex";
                    }
                  }}
                />
              ) : (
                <div
                  className="profile-avatar-placeholder-display"
                  aria-hidden="true"
                >
                  {userInitial}
                </div>
              )}
              <h1 className="profile-full-name">{userProfile.fullName}</h1>
              {userProfile.designation && userProfile.company && (
                <p className="profile-info-item">
                  <FaBriefcase className="profile-icon-detail" />{" "}
                  {userProfile.designation} at{" "}
                  <FaBuilding className="profile-icon-detail" />{" "}
                  {userProfile.company}
                </p>
              )}
              {userProfile.location && (
                <p className="profile-info-item">
                  <FaMapMarkerAlt className="profile-icon-detail" />{" "}
                  {userProfile.location}
                </p>
              )}
            </div>

            {/* Connection Action Buttons */}
            <div className="profile-action-buttons">
              {renderConnectionButtons()}
              {!isSelfProfile && (
                <button
                  onClick={() =>
                    toast.info("Messaging functionality coming soon!")
                  }
                  className="button-message"
                  disabled={connectionActionLoading}
                >
                  <FaEnvelope /> Message
                </button>
              )}
            </div>

            <div className="profile-details-group">
              <h2 className="section-heading">
                <FaInfoCircle className="section-heading-icon" /> About
              </h2>
              <p className="profile-bio-text">
                {userProfile.bio || "No bio available."}
              </p>
              {userProfile.email && (
                <p className="profile-info-item">
                  <strong className="info-label">
                    <FaEnvelope className="profile-icon-detail" /> Email:
                  </strong>{" "}
                  <span className="info-value">
                    <a href={`mailto:${userProfile.email}`}>
                      {userProfile.email}
                    </a>
                  </span>
                </p>
              )}
              {userProfile.phone && (
                <p className="profile-info-item">
                  <strong className="info-label">
                    <FaPhone className="profile-icon-detail" /> Phone:
                  </strong>{" "}
                  <span className="info-value">{userProfile.phone}</span>
                </p>
              )}
              {userProfile.yearsOfFinanceExperience && (
                <p className="profile-info-item">
                  <strong className="info-label">
                    <FaBriefcase className="profile-icon-detail" /> Experience:
                  </strong>{" "}
                  <span className="info-value">
                    {userProfile.yearsOfFinanceExperience} years in finance
                  </span>
                </p>
              )}
              {userProfile.budgetManaged && (
                <p className="profile-info-item">
                  <strong className="info-label">
                    <FaBuilding className="profile-icon-detail" /> Budget
                    Managed:
                  </strong>{" "}
                  <span className="info-value">
                    {userProfile.budgetManaged}
                  </span>
                </p>
              )}
              {typeof userProfile.isVerified === "boolean" && (
                <p className="profile-info-item">
                  <strong className="info-label">
                    {userProfile.isVerified ? (
                      <FaCheckCircle className="profile-icon-detail verified-status-icon" />
                    ) : (
                      <FaTimesCircle className="profile-icon-detail unverified-status-icon" />
                    )}{" "}
                    Verified:
                  </strong>{" "}
                  <span className="info-value">
                    {userProfile.isVerified ? "Yes" : "No"}
                  </span>
                </p>
              )}
            </div>

            {userProfile.financialCertifications?.length > 0 && (
              <div className="profile-details-group">
                <h2 className="section-heading">
                  <FaGraduationCap className="section-heading-icon" />{" "}
                  Certifications
                </h2>
                <ul className="profile-list-items">
                  {userProfile.financialCertifications.map((cert, index) => (
                    <li key={index} className="list-item-detail">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {userProfile.industrySpecializations?.length > 0 && (
              <div className="profile-details-group">
                <h2 className="section-heading">
                  <FaIndustry className="section-heading-icon" /> Industry
                  Specializations
                </h2>
                <ul className="profile-list-items">
                  {userProfile.industrySpecializations.map((spec, index) => (
                    <li key={index} className="list-item-detail">
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {userProfile.keyFinancialSkills?.length > 0 && (
              <div className="profile-details-group">
                <h2 className="section-heading">
                  <FaLightbulb className="section-heading-icon" /> Key Skills
                </h2>
                <ul className="profile-list-items skills-grid">
                  {userProfile.keyFinancialSkills.map((skill, index) => (
                    <li key={index} className="skill-badge">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {userProfile.linkedin && (
              <div className="profile-details-group">
                <p className="profile-linkedin-link-wrapper">
                  <a
                    href={userProfile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-link-display"
                    aria-label={`Visit ${userProfile.fullName}'s LinkedIn profile`}
                  >
                    <FaLinkedin /> View LinkedIn Profile
                  </a>
                </p>
              </div>
            )}

            <div className="profile-footer-actions">
              <button onClick={() => navigate(-1)} className="button-secondary">
                Back to Connections
              </button>
            </div>
          </div>
        </div>

        <div className="profile-sidebar-content-area">
          {/* User Events Section (First in sidebar) */}
          <div className="sidebar-section-card">
            <h2 className="sidebar-section-heading">
              <FaCalendarAlt className="sidebar-heading-icon" /> User Events
            </h2>
            {eventsLoading ? (
              <p className="loading-message-sidebar">Loading events...</p>
            ) : eventsError ? (
              <p className="error-message-sidebar">{eventsError}</p>
            ) : userEvents.length > 0 ? (
              <div className="sidebar-events-list">
                {userEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="sidebar-event-item"
                    onClick={() => handleEventClick(event._id)}
                    tabIndex="0"
                    role="link"
                  >
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="sidebar-event-image"
                      />
                    )}
                    <div className="sidebar-event-details">
                      <h4 className="sidebar-event-title">{event.title}</h4>
                      <p className="sidebar-event-date">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {userEvents.length > 3 && (
                  <button
                    onClick={() => navigate(`/user/${userId}/events`)}
                    className="sidebar-view-all-button"
                  >
                    View all events
                  </button>
                )}
              </div>
            ) : (
              <div className="no-sidebar-items-found">
                <p>No events scheduled yet.</p>
              </div>
            )}
          </div>

          {/* User Blogs Section (Second in sidebar) */}
          <div className="sidebar-section-card">
            <h2 className="sidebar-section-heading">
              <FaRegNewspaper className="sidebar-heading-icon" /> User Blogs
            </h2>
            {blogsLoading ? (
              <p className="loading-message-sidebar">Loading blogs...</p>
            ) : blogsError ? (
              <p className="error-message-sidebar">{blogsError}</p>
            ) : userBlogs.length > 0 ? (
              <div className="sidebar-blogs-list">
                {userBlogs.slice(0, 3).map((blog) => (
                  <div
                    key={blog._id}
                    className="sidebar-blog-item"
                    onClick={() => handleBlogClick(blog._id)}
                    tabIndex="0"
                    role="link"
                  >
                    {blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="sidebar-blog-image"
                      />
                    )}
                    <div className="sidebar-blog-details">
                      <h4 className="sidebar-blog-title">{blog.title}</h4>
                      <p className="sidebar-blog-date">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {userBlogs.length > 3 && (
                  <button
                    onClick={() => navigate(`/user/${userId}/blogs`)}
                    className="sidebar-view-all-button"
                  >
                    View all blogs
                  </button>
                )}
              </div>
            ) : (
              <div className="no-sidebar-items-found">
                <p>No blogs published yet.</p>
              </div>
            )}
          </div>

          {/* People You May Know (Connections Suggestions) Section (Third in sidebar) */}
          <div className="sidebar-section-card">
            <h2 className="sidebar-section-heading">
              <FaUsers className="sidebar-heading-icon" /> People You May Know
            </h2>
            {connectionsLoading ? (
              <p className="loading-message-sidebar">Loading suggestions...</p>
            ) : connectionsError ? (
              <p className="error-message-sidebar">{connectionsError}</p>
            ) : peopleYouMayKnow.length > 0 ? (
              <div className="sidebar-connections-list">
                {peopleYouMayKnow.slice(0, 5).map((person) => (
                  <div key={person._id} className="sidebar-connection-item">
                    <img
                      src={
                        person.profilePic ||
                        `https://placehold.co/50x50/aabbcc/ffffff?text=${person.fullName.charAt(
                          0
                        )}`
                      }
                      alt={person.fullName}
                      className="sidebar-connection-avatar"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/50x50/aabbcc/ffffff?text=${person.fullName.charAt(
                          0
                        )}`;
                      }}
                    />
                    <div className="sidebar-connection-details">
                      <h4
                        className="sidebar-connection-name"
                        onClick={() => navigate(`/profile/${person._id}`)}
                      >
                        {person.fullName}
                      </h4>
                      <p className="sidebar-connection-designation">
                        {person.designation || "No Designation"}
                      </p>
                      {person.connectionStatus === "not_connected" && (
                        <button
                          onClick={() =>
                            handleConnectionAction("connect", person._id)
                          }
                          className="sidebar-connect-button"
                          disabled={connectionActionLoading}
                        >
                          Connect
                        </button>
                      )}
                      {person.connectionStatus === "pending_sent" && (
                        <button
                          className="sidebar-request-sent-button"
                          disabled
                        >
                          Request Sent
                        </button>
                      )}
                      {person.connectionStatus === "connected" && (
                        <button className="sidebar-connected-button" disabled>
                          Connected
                        </button>
                      )}
                      {person.connectionStatus === "pending_received" && (
                        <button
                          onClick={() =>
                            handleConnectionAction("accept", person._id)
                          }
                          className="sidebar-accept-button"
                          disabled={connectionActionLoading}
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {peopleYouMayKnow.length > 5 && (
                  <button
                    onClick={() => navigate(`/connections/suggestions`)}
                    className="sidebar-view-all-button"
                  >
                    View all suggestions
                  </button>
                )}
              </div>
            ) : (
              <div className="no-sidebar-items-found">
                <p>No new connection suggestions at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfilePage;
