import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/ManageRequestsPage.css";

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
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        setError(
          "Access Denied. Your session might have expired or you don't have permission."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to fetch connection requests and connections."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user]); // Re-run if user data changes

  // Fetch data on component mount and when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchData();
    } else {
      setLoading(false);
      setError("Please log in to view this page.");
    }
  }, [user, fetchData]);

  // --- Action Handlers ---

  const handleAcceptRequest = async (requestId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Authentication token missing. Please log in.");
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
      alert("Connection request accepted!");
      fetchData(); // Re-fetch data to update UI
    } catch (err) {
      alert(
        `Failed to accept request: ${
          err.response?.data?.message || err.message
        }`
      );
      console.error("Error accepting request:", err);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Authentication token missing. Please log in.");
      return;
    }
    try {
      await axios.put(
        // Backend expects PUT for decline as per your previous conversation
        `/api/v1/connections/${requestId}/decline`,
        {},
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      alert("Connection request declined!");
      fetchData(); // Re-fetch data to update UI
    } catch (err) {
      alert(
        `Failed to decline request: ${
          err.response?.data?.message || err.message
        }`
      );
      console.error("Error declining request:", err);
    }
  };

  const handleCancelRequest = async (requestId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Authentication token missing. Please log in.");
      return;
    }
    if (!window.confirm("Are you sure you want to cancel this request?")) {
      return; // User cancelled the action
    }
    try {
      await axios.delete(`/api/v1/connections/${requestId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      alert("Connection request cancelled!");
      fetchData(); // Re-fetch data to update UI
    } catch (err) {
      alert(
        `Failed to cancel request: ${
          err.response?.data?.message || err.message
        }`
      );
      console.error("Error cancelling request:", err);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Authentication token missing. Please log in.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this connection?")) {
      return; // User cancelled the action
    }
    try {
      await axios.delete(`/api/v1/connections/${connectionId}/remove`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      alert("Connection removed!");
      fetchData(); // Re-fetch data to update UI
    } catch (err) {
      alert(
        `Failed to remove connection: ${
          err.response?.data?.message || err.message
        }`
      );
      console.error("Error removing connection:", err);
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading connection data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-container">
        <header className="connections-header">
          <div className="header-left">
            <Link to="/" className="header-logo">
              Jobizaa Network || Home
            </Link>
          </div>
          <div className="header-right">
            {user && (
              <Link to="/profile" className="header-profile-link">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="header-profile-avatar"
                  />
                ) : (
                  <div className="header-profile-avatar-placeholder">
                    {user.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span>My Profile</span>
              </Link>
            )}
            <Link to="/settings" className="header-icon-link">
              <i className="fas fa-cog"></i>
            </Link>
            <button className="btn-logout-header" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <div className="main-layout">
          <aside className="left-sidebar">
            <div className="sidebar-card">
              <div className="profile-summary">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={`${user.fullName}'s profile`}
                    className="profile-avatar"
                  />
                ) : (
                  <div
                    className="profile-avatar"
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
                <div className="profile-info">
                  <h3>{user?.fullName}</h3>
                  <p className="profile-title">
                    {user?.designation || "Professional"}
                  </p>
                  <p className="profile-company">{user?.company}</p>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3 className="card-title">Quick Actions</h3>
              <nav className="quick-nav">
                <Link to="/connections" className="nav-link">
                  🌐 Discover People
                </Link>
                {user && user.role === "admin" && (
                  <Link
                    to="/admin/manage-all-connections"
                    className="nav-link admin-link"
                  >
                    ⚙️ Manage All Connections
                  </Link>
                )}
                <Link to="/" className="nav-link">
                  🏠 Go to Home
                </Link>
              </nav>
            </div>

            <div className="sidebar-card">
              <h3 className="card-title">My Request Stats</h3>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">{receivedRequests.length}</span>
                  <span className="stat-label">Incoming</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{sentRequests.length}</span>
                  <span className="stat-label">Outgoing</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {acceptedConnections.length}
                  </span>
                  <span className="stat-label">Connections</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="main-content">
            {/* Received Pending Requests */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="section-title">
                  Incoming Connection Requests ({receivedRequests.length})
                </h2>
                <p className="section-subtitle">
                  Review requests from other professionals.
                </p>
              </div>
              {receivedRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✉️</div>
                  <h3>No incoming requests</h3>
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {receivedRequests.map((request) => (
                    <div key={request._id} className="request-card">
                      <div className="request-user-info">
                        {request.sender?.profilePic ? (
                          <img
                            src={request.sender.profilePic}
                            alt={`${request.sender.fullName}'s profile`}
                            className="user-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="user-avatar"
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
                          <h3 className="user-name">
                            {request.sender?.fullName}
                          </h3>
                          <p className="user-title">
                            {request.sender?.designation}
                          </p>
                          <p className="user-company">
                            {request.sender?.company}
                          </p>
                          <p className="user-email">{request.sender?.email}</p>
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="btn btn-accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request._id)}
                          className="btn btn-decline"
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
            <div className="content-card mt-8">
              <div className="card-header">
                <h2 className="section-title">
                  Outgoing Connection Requests ({sentRequests.length})
                </h2>
                <p className="section-subtitle">
                  Requests you've sent that are pending.
                </p>
              </div>
              {sentRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📤</div>
                  <h3>No outgoing requests</h3>
                  <p>Send a new connection request to discover others.</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {sentRequests.map((request) => (
                    <div key={request._id} className="request-card">
                      <div className="request-user-info">
                        {request.receiver?.profilePic ? (
                          <img
                            src={request.receiver.profilePic}
                            alt={`${request.receiver.fullName}'s profile`}
                            className="user-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="user-avatar"
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
                          <h3 className="user-name">
                            {request.receiver?.fullName}
                          </h3>
                          <p className="user-title">
                            {request.receiver?.designation}
                          </p>
                          <p className="user-company">
                            {request.receiver?.company}
                          </p>
                          <p className="user-email">
                            {request.receiver?.email}
                          </p>
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleCancelRequest(request._id)}
                          className="btn btn-cancel"
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
            <div className="content-card mt-8">
              <div className="card-header">
                <h2 className="section-title">
                  My Connections ({acceptedConnections.length})
                </h2>
                <p className="section-subtitle">
                  Professionals you are connected with.
                </p>
              </div>
              {acceptedConnections.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔗</div>
                  <h3>No connections yet</h3>
                  <p>Send or accept requests to grow your network!</p>
                </div>
              ) : (
                <div className="requests-grid">
                  {acceptedConnections.map((connection) => (
                    <div key={connection._id} className="request-card">
                      <div className="request-user-info">
                        {connection.connectedUser?.profilePic ? (
                          <img
                            src={connection.connectedUser.profilePic}
                            alt={`${connection.connectedUser.fullName}'s profile`}
                            className="user-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="user-avatar"
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
                          <h3 className="user-name">
                            {connection.connectedUser?.fullName}
                          </h3>
                          <p className="user-title">
                            {connection.connectedUser?.designation}
                          </p>
                          <p className="user-company">
                            {connection.connectedUser?.company}
                          </p>
                          <p className="user-email">
                            {connection.connectedUser?.email}
                          </p>
                        </div>
                      </div>
                      <div className="request-actions">
                        <button
                          onClick={() => handleRemoveConnection(connection._id)}
                          className="btn btn-remove"
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

          <aside className="right-sidebar">
            <div className="sidebar-card">
              <h3 className="card-title">Network Tips</h3>
              <ul className="tips-list">
                <li>🎯 Keep your profile updated for better visibility.</li>
                <li>🤝 Connect with people from diverse industries.</li>
                <li>✉️ Personalize your connection requests.</li>
                <li>📈 Engage with your connections' posts.</li>
                <li>🗓️ Schedule virtual coffee chats.</li>
              </ul>
            </div>
            <div className="sidebar-card">
              <h3 className="card-title">Need Help?</h3>
              <p className="help-text">
                If you encounter any issues or have questions, feel free to
                contact our support team.
              </p>
              <button className="btn btn-primary">Contact Support</button>
            </div>
          </aside>
        </div>

        <footer className="page-footer">
          <div className="footer-content">
            <button className="btn btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}

export default ManageRequestsPage;
