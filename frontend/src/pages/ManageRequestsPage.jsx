import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/ManageRequestsPage.css";
import ConnectionsHeader from "../components/ConnectionsHeader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageRequestsPage() {
  const { user, logout } = useAuth();

  // State to hold different types of connection data
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch all necessary connection data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const storedToken = localStorage.getItem("token");

    if (!storedToken || !user || !user.id) {
      setError("Please log in to manage your connections.");
      setLoading(false);
      toast.error("Please log in to manage your connections.", {
        autoClose: 5000,
      });
      return;
    }

    try {
      // Fetch received pending requests
      const receivedPendingResponse = await axios.get(
        "/api/v1/connections/my-connections/received-pending",
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      setReceivedRequests(receivedPendingResponse.data.data || []);

      // Fetch sent pending requests
      const sentPendingResponse = await axios.get(
        "/api/v1/connections/my-connections/sent-pending",
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      setSentRequests(sentPendingResponse.data.data || []);

      // Fetch accepted connections
      const acceptedConnectionsResponse = await axios.get(
        "/api/v1/connections/my-connections",
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      setAcceptedConnections(acceptedConnectionsResponse.data.data || []);
    } catch (err) {
      console.error("Error fetching connection data:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to fetch connection requests and connections.";

      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError(
          "Access Denied. Your session might have expired or you don't have permission."
        );
        toast.error("Access Denied. Please log in again.", { autoClose: 5000 });
      } else {
        setError(errorMessage);
        toast.error(errorMessage, { autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch data on component mount and when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchData();
    } else {
      setLoading(false);
      setError("Please log in to view this page.");
      toast.info("Please log in to view this page.", { autoClose: 5000 });
    }
  }, [user, fetchData]);

  // --- Action Handlers ---

  const handleAcceptRequest = async (requestId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      toast.error("Authentication token missing. Please log in.", {
        autoClose: 3000,
      });
      return;
    }
    try {
      await axios.put(
        `/api/v1/connections/${requestId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      toast.success("Connection request accepted!", { autoClose: 3000 });
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to accept request.";
      toast.error(`Failed to accept request: ${errorMessage}`, {
        autoClose: 5000,
      });
      console.error("Error accepting request:", err);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      toast.error("Authentication token missing. Please log in.", {
        autoClose: 3000,
      });
      return;
    }
    try {
      await axios.put(
        `/api/v1/connections/${requestId}/decline`,
        {},
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      toast.info("Connection request declined!", { autoClose: 3000 });
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to decline request.";
      toast.error(`Failed to decline request: ${errorMessage}`, {
        autoClose: 5000,
      });
      console.error("Error declining request:", err);
    }
  };

  const handleCancelRequest = async (requestId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      toast.error("Authentication token missing. Please log in.", {
        autoClose: 3000,
      });
      return;
    }
    if (!window.confirm("Are you sure you want to cancel this request?")) {
      return;
    }
    try {
      await axios.delete(`/api/v1/connections/${requestId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      toast.warn("Connection request cancelled!", { autoClose: 3000 });
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to cancel request.";
      toast.error(`Failed to cancel request: ${errorMessage}`, {
        autoClose: 5000,
      });
      console.error("Error cancelling request:", err);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      toast.error("Authentication token missing. Please log in.", {
        autoClose: 3000,
      });
      return;
    }
    if (!window.confirm("Are you sure you want to remove this connection?")) {
      return;
    }
    try {
      await axios.delete(`/api/v1/connections/${connectionId}/remove`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      toast.warn("Connection removed!", { autoClose: 3000 });
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove connection.";
      toast.error(`Failed to remove connection: ${errorMessage}`, {
        autoClose: 5000,
      });
      console.error("Error removing connection:", err);
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="manage-requests-dashboard-container">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="manage-requests-page-wrapper">
          <div className="loading-state-indicator">
            Loading connection data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-requests-dashboard-container">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="manage-requests-page-wrapper">
          <div className="error-display-card">
            <h2 className="error-title">Error</h2>
            <p className="error-message-text">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-action-button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-requests-dashboard-container">
      {/* The ToastContainer should ideally be in your App.js or main layout component */}
      {/* Placing it here for demonstration, but consider moving it up for global toasts */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <ConnectionsHeader />
      <div className="manage-requests-page-wrapper">
        <div className="main-content-layout">
          <aside className="left-navigation-sidebar">
            <div className="sidebar-profile-card">
              <div className="user-profile-overview">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={`${user.fullName}'s profile`}
                    className="profile-display-avatar"
                  />
                ) : (
                  <div
                    className="profile-display-avatar"
                    style={{
                      background: "linear-gradient(135deg, #0a66c2, #004d96)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {user?.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="profile-details-info">
                  <h3 className="profile-full-name">{user?.fullName}</h3>
                  <p className="profile-designation">
                    {user?.designation || "Professional"}
                  </p>
                  <p className="profile-company-name">{user?.company}</p>
                </div>
              </div>
            </div>

            <div className="sidebar-quick-actions-card">
              <h3 className="card-heading-title">Quick Actions</h3>
              <nav className="quick-navigation-links">
                <Link to="/connections" className="nav-link-item">
                  🌐 Discover People
                </Link>
                {user && user.role === "admin" && (
                  <Link
                    to="/admin/manage-all-connections"
                    className="nav-link-item admin-portal-link"
                  >
                    ⚙️ Manage All Connections
                  </Link>
                )}
                <Link to="/" className="nav-link-item">
                  🏠 Go to Home
                </Link>
              </nav>
            </div>

            <div className="sidebar-stats-card">
              <h3 className="card-heading-title">My Request Stats</h3>
              <div className="connection-stats-grid">
                <div className="stat-item-display">
                  <span className="stat-numeric-value">
                    {receivedRequests.length}
                  </span>
                  <span className="stat-label-text">Incoming</span>
                </div>
                <div className="stat-item-display">
                  <span className="stat-numeric-value">
                    {sentRequests.length}
                  </span>
                  <span className="stat-label-text">Outgoing</span>
                </div>
                <div className="stat-item-display">
                  <span className="stat-numeric-value">
                    {acceptedConnections.length}
                  </span>
                  <span className="stat-label-text">Connections</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="central-content-area">
            {/* Received Pending Requests */}
            <div className="content-section-card">
              <div className="section-header-details">
                <h2 className="section-main-title">
                  Incoming Connection Requests ({receivedRequests.length})
                </h2>
                <p className="section-sub-heading">
                  Review requests from other professionals.
                </p>
              </div>
              {receivedRequests.length === 0 ? (
                <div className="empty-state-message">
                  <div className="empty-state-icon">✉️</div>
                  <h3 className="empty-state-title">No incoming requests</h3>
                  <p className="empty-state-description">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="connection-cards-grid">
                  {receivedRequests.map((request) => (
                    <div key={request._id} className="connection-request-card">
                      <div className="request-sender-info">
                        {request.sender?.profilePic ? (
                          <img
                            src={request.sender.profilePic}
                            alt={`${request.sender.fullName}'s profile`}
                            className="sender-profile-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="sender-profile-avatar"
                            style={{
                              background:
                                "linear-gradient(135deg, #0077B5, #005682)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {request.sender?.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="sender-full-name">
                            {request.sender?.fullName}
                          </h3>
                          <p className="sender-designation-title">
                            {request.sender?.designation}
                          </p>
                          <p className="sender-company-name">
                            {request.sender?.company}
                          </p>
                          <p className="sender-email-address">
                            {request.sender?.email}
                          </p>
                        </div>
                      </div>
                      <div className="request-action-buttons">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="action-button-primary"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request._id)}
                          className="action-button-secondary"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Pending Requests */}
            <div className="content-section-card mt-8">
              <div className="section-header-details">
                <h2 className="section-main-title">
                  Outgoing Connection Requests ({sentRequests.length})
                </h2>
                <p className="section-sub-heading">
                  Requests you've sent that are pending.
                </p>
              </div>
              {sentRequests.length === 0 ? (
                <div className="empty-state-message">
                  <div className="empty-state-icon">📤</div>
                  <h3 className="empty-state-title">No outgoing requests</h3>
                  <p className="empty-state-description">
                    Send a new connection request to discover others.
                  </p>
                </div>
              ) : (
                <div className="connection-cards-grid">
                  {sentRequests.map((request) => (
                    <div key={request._id} className="connection-request-card">
                      <div className="request-receiver-info">
                        {request.receiver?.profilePic ? (
                          <img
                            src={request.receiver.profilePic}
                            alt={`${request.receiver.fullName}'s profile`}
                            className="receiver-profile-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="receiver-profile-avatar"
                            style={{
                              background:
                                "linear-gradient(135deg, #FF6F61, #E04D38)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {request.receiver?.fullName
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="receiver-full-name">
                            {request.receiver?.fullName}
                          </h3>
                          <p className="receiver-designation-title">
                            {request.receiver?.designation}
                          </p>
                          <p className="receiver-company-name">
                            {request.receiver?.company}
                          </p>
                          <p className="receiver-email-address">
                            {request.receiver?.email}
                          </p>
                        </div>
                      </div>
                      <div className="request-action-buttons">
                        <button
                          onClick={() => handleCancelRequest(request._id)}
                          className="action-button-cancel"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Established Connections */}
            <div className="content-section-card mt-8">
              <div className="section-header-details">
                <h2 className="section-main-title">
                  My Connections ({acceptedConnections.length})
                </h2>
                <p className="section-sub-heading">
                  Professionals you are connected with.
                </p>
              </div>
              {acceptedConnections.length === 0 ? (
                <div className="empty-state-message">
                  <div className="empty-state-icon">🔗</div>
                  <h3 className="empty-state-title">No connections yet</h3>
                  <p className="empty-state-description">
                    Send or accept requests to grow your network!
                  </p>
                </div>
              ) : (
                <div className="connection-cards-grid">
                  {acceptedConnections.map((connection) => (
                    <div
                      key={connection._id}
                      className="connection-request-card"
                    >
                      <div className="connected-user-info">
                        {connection.connectedUser?.profilePic ? (
                          <img
                            src={connection.connectedUser.profilePic}
                            alt={`${connection.connectedUser.fullName}'s profile`}
                            className="connected-user-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="connected-user-avatar"
                            style={{
                              background:
                                "linear-gradient(135deg, #4CAF50, #2E8B57)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {connection.connectedUser?.fullName
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="connected-user-full-name">
                            {connection.connectedUser?.fullName}
                          </h3>
                          <p className="connected-user-designation-title">
                            {connection.connectedUser?.designation}
                          </p>
                          <p className="connected-user-company-name">
                            {connection.connectedUser?.company}
                          </p>
                          <p className="connected-user-email-address">
                            {connection.connectedUser?.email}
                          </p>
                        </div>
                      </div>
                      <div className="connection-action-buttons">
                        <button
                          onClick={() => handleRemoveConnection(connection._id)}
                          className="action-button-remove"
                        >
                          Remove Connection
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          <aside className="right-utility-sidebar">
            <div className="sidebar-tips-card">
              <h3 className="card-heading-title">Network Tips</h3>
              <ul className="tips-list-items">
                <li>🎯 Keep your profile updated for better visibility.</li>
                <li>🤝 Connect with people from diverse industries.</li>
                <li>✉️ Personalize your connection requests.</li>
                <li>📈 Engage with your connections' posts.</li>
                <li>🗓️ Schedule virtual coffee chats.</li>
              </ul>
            </div>
            <div className="sidebar-help-card">
              <h3 className="card-heading-title">Need Help?</h3>
              <p className="help-text-content">
                If you encounter any issues or have questions, feel free to
                contact our support team.
              </p>
              <button className="support-contact-button">
                Contact Support
              </button>
            </div>
          </aside>
        </div>

        <footer className="page-bottom-footer">
          <div className="footer-content-wrapper">
            <button className="footer-logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ManageRequestsPage;
