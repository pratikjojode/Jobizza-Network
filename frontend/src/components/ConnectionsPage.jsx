import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import "../styles/ConnectionsPage.css";

function ConnectionsPage() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [userConnectionStatuses, setUserConnectionStatuses] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      setLoggedInUserId(user.id);
    } else {
      setLoggedInUserId(null);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes

    setLoading(true);
    setError(null);

    const storedToken = localStorage.getItem("token");

    if (!storedToken || !user || !user.id) {
      setError("Please log in to manage your connections.");
      setLoading(false);
      return;
    }

    try {
      // Fetch all users
      const usersResponse = await axios.get("/api/v1/connections/all-users", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      const allUsers = usersResponse.data.data || [];
      const filteredUsers = allUsers.filter(
        (u) => String(u._id) !== String(user.id)
      );
      setUsers(filteredUsers);

      // Fetch connection data
      const [
        connectionsResponse,
        sentPendingResponse,
        receivedPendingResponse,
      ] = await Promise.all([
        axios.get("/api/v1/connections/my-connections", {
          headers: { Authorization: `Bearer ${storedToken}` },
        }),
        axios.get("/api/v1/connections/my-connections/sent-pending", {
          headers: { Authorization: `Bearer ${storedToken}` },
        }),
        axios.get("/api/v1/connections/my-connections/received-pending", {
          headers: { Authorization: `Bearer ${storedToken}` },
        }),
      ]);

      const currentConnections = connectionsResponse.data.data || [];
      const sentPendingRequests = sentPendingResponse.data.data || [];
      const receivedPendingRequests = receivedPendingResponse.data.data || [];

      const statusMap = {};

      // Initialize all users as not connected
      filteredUsers.forEach((u) => {
        statusMap[String(u._id)] = {
          status: "not_connected",
          requestId: null,
        };
      });

      // Process accepted connections
      currentConnections.forEach((conn) => {
        if (conn.connectedUser?._id) {
          const connectedUserId = String(conn.connectedUser._id);
          statusMap[connectedUserId] = {
            status: "accepted",
            requestId: conn._id,
          };
        }
      });

      // Process sent pending requests
      sentPendingRequests.forEach((req) => {
        if (req.receiver?._id) {
          statusMap[String(req.receiver._id)] = {
            status: "pending_sent",
            requestId: req._id,
          };
        }
      });

      // Process received pending requests
      receivedPendingRequests.forEach((req) => {
        if (req.sender?._id) {
          statusMap[String(req.sender._id)] = {
            status: "pending_received",
            requestId: req._id,
          };
        }
      });

      setUserConnectionStatuses(statusMap);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Session expired. Please log in again.");
        logout();
      } else {
        setError(err.response?.data?.message || "Failed to fetch data.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, logout, refreshing]);

  useEffect(() => {
    if (user && user.id) {
      fetchData();
    } else {
      setLoading(false);
      setError("Please log in to view this page.");
    }
  }, [user, fetchData]);

  const handleConnect = async (receiverId) => {
    if (!loggedInUserId) {
      alert("You must be logged in to send a connection request.");
      return;
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [receiverId]: true }));

    try {
      await axios.post(
        "/api/v1/connections",
        { receiverId },
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      // Update the status immediately
      setUserConnectionStatuses((prev) => ({
        ...prev,
        [receiverId]: {
          status: "pending_sent",
          requestId: null,
        },
      }));

      alert("Connection request sent successfully!");
      await fetchData();
    } catch (err) {
      console.error("Error sending connection request:", err);
      const errorMessage = err.response?.data?.message || err.message;

      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
      } else if (
        errorMessage.includes("cannot send a connection request to yourself")
      ) {
        alert("You cannot send a connection request to yourself.");
      } else {
        alert(`Failed to send request: ${errorMessage}`);
        await fetchData(); // Refresh to sync state
      }
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[receiverId];
        return newState;
      });
    }
  };

  const handleAcceptRequest = async (senderId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    const connectionRequestData = userConnectionStatuses[senderId];
    if (!connectionRequestData?.requestId) {
      alert("Connection request ID not found. Refreshing data...");
      await fetchData();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [senderId]: true }));

    try {
      await axios.put(
        `/api/v1/connections/${connectionRequestData.requestId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      setUserConnectionStatuses((prev) => ({
        ...prev,
        [senderId]: {
          status: "accepted",
          requestId: connectionRequestData.requestId,
        },
      }));

      alert("Connection request accepted!");
      await fetchData();
    } catch (err) {
      console.error("Error accepting connection request:", err);
      const errorMessage = err.response?.data?.message || err.message;

      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
      } else if (err.response?.status === 403) {
        alert("You are not authorized to accept this request.");
      } else if (err.response?.status === 404) {
        alert("Connection request not found. It may have been cancelled.");
      } else {
        alert(`Failed to accept request: ${errorMessage}`);
      }
      await fetchData();
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[senderId];
        return newState;
      });
    }
  };

  const handleDeclineRequest = async (senderId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    const connectionRequestData = userConnectionStatuses[senderId];
    if (!connectionRequestData?.requestId) {
      alert("Connection request ID not found. Refreshing data...");
      await fetchData();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [senderId]: true }));

    try {
      await axios.put(
        `/api/v1/connections/${connectionRequestData.requestId}/decline`,
        {},
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      setUserConnectionStatuses((prev) => ({
        ...prev,
        [senderId]: {
          status: "declined",
          requestId: null,
        },
      }));

      alert("Connection request declined!");
      await fetchData();
    } catch (err) {
      console.error("Error declining connection request:", err);
      const errorMessage = err.response?.data?.message || err.message;

      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
      } else if (err.response?.status === 403) {
        alert("You are not authorized to decline this request.");
      } else if (err.response?.status === 404) {
        alert("Connection request not found. It may have been cancelled.");
      } else {
        alert(`Failed to decline request: ${errorMessage}`);
      }
      await fetchData();
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[senderId];
        return newState;
      });
    }
  };

  const handleCancelRequest = async (receiverId) => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    const connectionRequestData = userConnectionStatuses[receiverId];
    if (!connectionRequestData?.requestId) {
      alert("Connection request ID not found. Refreshing data...");
      await fetchData();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [receiverId]: true }));

    try {
      await axios.delete(
        `/api/v1/connections/${connectionRequestData.requestId}`,
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      setUserConnectionStatuses((prev) => ({
        ...prev,
        [receiverId]: {
          status: "not_connected",
          requestId: null,
        },
      }));

      alert("Connection request cancelled!");
      await fetchData();
    } catch (err) {
      console.error("Error cancelling connection request:", err);
      const errorMessage = err.response?.data?.message || err.message;

      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
      } else if (err.response?.status === 403) {
        alert("You are not authorized to cancel this request.");
      } else if (err.response?.status === 404) {
        alert(
          "Connection request not found. It may have already been processed."
        );
      } else {
        alert(`Failed to cancel request: ${errorMessage}`);
      }
      await fetchData();
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[receiverId];
        return newState;
      });
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!confirm("Are you sure you want to remove this connection?")) {
      return;
    }

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    const connectionData = userConnectionStatuses[userId];
    if (!connectionData?.requestId) {
      alert("Connection ID not found. Refreshing data...");
      await fetchData();
      return;
    }

    setActionLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      await axios.delete(
        `/api/v1/connections/${connectionData.requestId}/remove`,
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      setUserConnectionStatuses((prev) => ({
        ...prev,
        [userId]: {
          status: "not_connected",
          requestId: null,
        },
      }));

      alert("Connection removed successfully!");
      await fetchData();
    } catch (err) {
      console.error("Error removing connection:", err);
      const errorMessage = err.response?.data?.message || err.message;

      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
      } else if (err.response?.status === 403) {
        alert("You are not authorized to remove this connection.");
      } else if (err.response?.status === 404) {
        alert("Connection not found.");
      } else {
        alert(`Failed to remove connection: ${errorMessage}`);
      }
      await fetchData();
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const getConnectionStatusText = (userId) => {
    const statusData = userConnectionStatuses[userId];
    const status = statusData ? statusData.status : "not_connected";

    if (actionLoading[userId]) {
      return "Processing...";
    }

    switch (status) {
      case "accepted":
        return "Connected";
      case "pending_sent":
        return "Request Sent";
      case "pending_received":
        return "Incoming Request";
      case "declined":
        return "Connect";
      case "not_connected":
      default:
        return "Connect";
    }
  };

  const isConnectButtonDisabled = (userId) => {
    const statusData = userConnectionStatuses[userId];
    const status = statusData ? statusData.status : "not_connected";

    return (
      actionLoading[userId] ||
      status === "pending_sent" ||
      status === "pending_received"
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading connections data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
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
                <Link to="/my-connections" className="nav-link">
                  📋 Manage My Requests
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
                <button
                  onClick={handleRefresh}
                  className="nav-link refresh-btn"
                  disabled={refreshing}
                >
                  {refreshing ? "🔄 Refreshing..." : "🔄 Refresh Data"}
                </button>
              </nav>
            </div>

            <div className="sidebar-card">
              <h3 className="card-title">Network Stats</h3>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">
                    {
                      Object.values(userConnectionStatuses).filter(
                        (statusData) => statusData.status === "accepted"
                      ).length
                    }
                  </span>
                  <span className="stat-label">Connections</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {
                      Object.values(userConnectionStatuses).filter(
                        (statusData) => statusData.status === "pending_received"
                      ).length
                    }
                  </span>
                  <span className="stat-label">Pending Requests</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {
                      Object.values(userConnectionStatuses).filter(
                        (statusData) => statusData.status === "pending_sent"
                      ).length
                    }
                  </span>
                  <span className="stat-label">Sent Requests</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="main-content">
            <div className="content-card">
              <div className="card-header">
                <h2 className="section-title">Discover People</h2>
                <p className="section-subtitle">
                  Connect with professionals in your network
                </p>
              </div>

              {users.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No users found</h3>
                  <p>Check back later for new connection opportunities.</p>
                </div>
              ) : (
                <div className="users-grid">
                  {users.map((otherUser) => (
                    <div key={otherUser._id} className="user-card">
                      <div className="user-header">
                        {otherUser.profilePic ? (
                          <img
                            src={otherUser.profilePic}
                            alt={`${otherUser.fullName}'s profile`}
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
                                "linear-gradient(135deg, #6b7280, #4b5563)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {otherUser.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="user-info">
                          <h3 className="user-name">{otherUser.fullName}</h3>
                          <p className="user-title">{otherUser.designation}</p>
                          <p className="user-company">{otherUser.company}</p>
                          <p className="user-email">{otherUser.email}</p>
                        </div>
                      </div>

                      <div className="user-actions">
                        {userConnectionStatuses[otherUser._id]?.status ===
                        "pending_received" ? (
                          <div className="pending-actions">
                            <button
                              onClick={() => handleAcceptRequest(otherUser._id)}
                              disabled={actionLoading[otherUser._id]}
                              className="btn btn-accept"
                            >
                              {actionLoading[otherUser._id]
                                ? "Processing..."
                                : "Accept"}
                            </button>
                            <button
                              onClick={() =>
                                handleDeclineRequest(otherUser._id)
                              }
                              disabled={actionLoading[otherUser._id]}
                              className="btn btn-decline"
                            >
                              {actionLoading[otherUser._id]
                                ? "Processing..."
                                : "Decline"}
                            </button>
                          </div>
                        ) : userConnectionStatuses[otherUser._id]?.status ===
                          "pending_sent" ? (
                          <button
                            onClick={() => handleCancelRequest(otherUser._id)}
                            disabled={actionLoading[otherUser._id]}
                            className="btn btn-cancel"
                          >
                            {actionLoading[otherUser._id]
                              ? "Processing..."
                              : "Cancel Request"}
                          </button>
                        ) : userConnectionStatuses[otherUser._id]?.status ===
                          "accepted" ? (
                          <div className="connected-actions">
                            <span className="connected-status">
                              ✅ Connected
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveConnection(otherUser._id)
                              }
                              disabled={actionLoading[otherUser._id]}
                              className="btn btn-remove"
                            >
                              {actionLoading[otherUser._id]
                                ? "Processing..."
                                : "Remove"}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConnect(otherUser._id)}
                            disabled={isConnectButtonDisabled(otherUser._id)}
                            className={`btn btn-connect ${
                              isConnectButtonDisabled(otherUser._id)
                                ? "disabled"
                                : ""
                            }`}
                          >
                            {getConnectionStatusText(otherUser._id)}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          <aside className="right-sidebar">
            <div className="sidebar-card">
              <h3 className="card-title">Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">🔔</div>
                  <div className="activity-content">
                    <p>
                      You have{" "}
                      {
                        Object.values(userConnectionStatuses).filter(
                          (statusData) =>
                            statusData.status === "pending_received"
                        ).length
                      }{" "}
                      pending connection requests
                    </p>
                    <span className="activity-time">Now</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">✅</div>
                  <div className="activity-content">
                    <p>
                      You're connected with{" "}
                      {
                        Object.values(userConnectionStatuses).filter(
                          (statusData) => statusData.status === "accepted"
                        ).length
                      }{" "}
                      professionals
                    </p>
                    <span className="activity-time">Today</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📤</div>
                  <div className="activity-content">
                    <p>
                      You sent{" "}
                      {
                        Object.values(userConnectionStatuses).filter(
                          (statusData) => statusData.status === "pending_sent"
                        ).length
                      }{" "}
                      connection requests
                    </p>
                    <span className="activity-time">Recent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3 className="card-title">People You May Know</h3>
              <div className="suggestions">
                {users
                  .filter(
                    (u) =>
                      userConnectionStatuses[u._id]?.status ===
                        "not_connected" ||
                      userConnectionStatuses[u._id]?.status === "declined"
                  )
                  .slice(0, 3)
                  .map((user) => (
                    <div key={user._id} className="suggestion-item">
                      <div className="suggestion-info">
                        <h4>{user.fullName}</h4>
                        <p>{user.designation}</p>
                      </div>
                      <button
                        className="btn-small btn-connect"
                        onClick={() => handleConnect(user._id)}
                        disabled={isConnectButtonDisabled(user._id)}
                      >
                        {actionLoading[user._id]
                          ? "..."
                          : getConnectionStatusText(user._id)}
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="sidebar-card">
              <h3 className="card-title">Coming Soon</h3>
              <div className="coming-soon">
                <div className="feature-item">📝 Blog Posts</div>
                <div className="feature-item">📅 Events</div>
                <div className="feature-item">💼 Job Postings</div>
                <div className="feature-item">🎯 Industry News</div>
              </div>
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

export default ConnectionsPage;
