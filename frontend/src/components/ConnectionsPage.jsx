import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/ConnectionsPage.css";

// Constants
const CONNECTION_STATUSES = {
  NOT_CONNECTED: "not_connected",
  ACCEPTED: "accepted",
  PENDING_SENT: "pending_sent",
  PENDING_RECEIVED: "pending_received",
  DECLINED: "declined",
};

const API_ENDPOINTS = {
  ALL_USERS: "/api/v1/connections/all-users",
  MY_CONNECTIONS: "/api/v1/connections/my-connections",
  SENT_PENDING: "/api/v1/connections/my-connections/sent-pending",
  RECEIVED_PENDING: "/api/v1/connections/my-connections/received-pending",
  CONNECTIONS: "/api/v1/connections",
};

// Custom hooks
const useConnectionData = (user, logout) => {
  const [state, setState] = useState({
    users: [],
    loading: true,
    error: null,
    userConnectionStatuses: {},
    actionLoading: {},
    refreshing: false,
  });

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  const fetchData = useCallback(async () => {
    if (state.refreshing) return;

    updateState({ loading: true, error: null });
    const headers = getAuthHeaders();

    if (!headers || !user?.id) {
      updateState({
        error: "Please log in to manage your connections.",
        loading: false,
      });
      return;
    }

    try {
      const [
        usersResponse,
        connectionsResponse,
        sentPendingResponse,
        receivedPendingResponse,
      ] = await Promise.all([
        axios.get(API_ENDPOINTS.ALL_USERS, { headers }),
        axios.get(API_ENDPOINTS.MY_CONNECTIONS, { headers }),
        axios.get(API_ENDPOINTS.SENT_PENDING, { headers }),
        axios.get(API_ENDPOINTS.RECEIVED_PENDING, { headers }),
      ]);

      const allUsers = usersResponse.data.data || [];
      const filteredUsers = allUsers.filter(
        (u) => String(u._id) !== String(user.id)
      );

      const currentConnections = connectionsResponse.data.data || [];
      const sentPendingRequests = sentPendingResponse.data.data || [];
      const receivedPendingRequests = receivedPendingResponse.data.data || [];

      // Build status map efficiently
      const statusMap = filteredUsers.reduce((acc, u) => {
        acc[String(u._id)] = {
          status: CONNECTION_STATUSES.NOT_CONNECTED,
          requestId: null,
        };
        return acc;
      }, {});

      // Process connections
      [
        {
          data: currentConnections,
          status: CONNECTION_STATUSES.ACCEPTED,
          key: "connectedUser",
        },
        {
          data: sentPendingRequests,
          status: CONNECTION_STATUSES.PENDING_SENT,
          key: "receiver",
        },
        {
          data: receivedPendingRequests,
          status: CONNECTION_STATUSES.PENDING_RECEIVED,
          key: "sender",
        },
      ].forEach(({ data, status, key }) => {
        data.forEach((item) => {
          const userId = String(item[key]?._id);
          if (userId && statusMap[userId]) {
            statusMap[userId] = { status, requestId: item._id };
          }
        });
      });

      updateState({
        users: filteredUsers,
        userConnectionStatuses: statusMap,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      const isAuthError =
        err.response?.status === 401 || err.response?.status === 403;

      if (isAuthError) {
        updateState({
          error: "Session expired. Please log in again.",
          loading: false,
        });
        logout();
      } else {
        updateState({
          error: err.response?.data?.message || "Failed to fetch data.",
          loading: false,
        });
      }
    }
  }, [user, logout, state.refreshing, getAuthHeaders, updateState]);

  const refresh = useCallback(async () => {
    updateState({ refreshing: true });
    await fetchData();
    updateState({ refreshing: false });
  }, [fetchData, updateState]);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    } else {
      updateState({
        loading: false,
        error: "Please log in to view this page.",
      });
    }
  }, [user, fetchData, updateState]);

  return { ...state, fetchData, refresh, updateState, getAuthHeaders };
};

// Component for user action buttons
const UserActionButtons = ({
  userId,
  status,
  actionLoading,
  onConnect,
  onAccept,
  onDecline,
  onCancel,
  onRemove,
}) => {
  const isLoading = actionLoading[userId];
  const loadingText = "Processing...";

  switch (status) {
    case CONNECTION_STATUSES.PENDING_RECEIVED:
      return (
        <div className="pending-actions">
          <button
            onClick={() => onAccept(userId)}
            disabled={isLoading}
            className="btn btn-accept"
            aria-label="Accept connection request"
          >
            {isLoading ? loadingText : "Accept"}
          </button>
          <button
            onClick={() => onDecline(userId)}
            disabled={isLoading}
            className="btn btn-decline"
            aria-label="Decline connection request"
          >
            {isLoading ? loadingText : "Decline"}
          </button>
        </div>
      );

    case CONNECTION_STATUSES.PENDING_SENT:
      return (
        <button
          onClick={() => onCancel(userId)}
          disabled={isLoading}
          className="btn btn-cancel"
          aria-label="Cancel connection request"
        >
          {isLoading ? loadingText : "Cancel Request"}
        </button>
      );

    case CONNECTION_STATUSES.ACCEPTED:
      return (
        <div className="connected-actions">
          <span className="connected-status" aria-label="Connected">
            ✅ Connected
          </span>
          <button
            onClick={() => onRemove(userId)}
            disabled={isLoading}
            className="btn btn-remove"
            aria-label="Remove connection"
          >
            {isLoading ? loadingText : "Remove"}
          </button>
        </div>
      );

    default:
      return (
        <button
          onClick={() => onConnect(userId)}
          disabled={isLoading || status === CONNECTION_STATUSES.PENDING_SENT}
          className={`btn btn-connect ${isLoading ? "disabled" : ""}`}
          aria-label="Send connection request"
        >
          {isLoading ? loadingText : "Connect"}
        </button>
      );
  }
};

// User card component
const UserCard = ({ user, status, actionLoading, actions }) => {
  const userInitial = user.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className="user-card"
      role="article"
      aria-labelledby={`user-${user._id}`}
    >
      <div className="user-header">
        {user.profilePic ? (
          <img
            src={user.profilePic}
            alt={`${user.fullName}'s profile`}
            className="user-avatar"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="user-avatar"
          style={{
            background: "linear-gradient(135deg, #6b7280, #4b5563)",
            display: user.profilePic ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "white",
            fontWeight: "bold",
          }}
          aria-hidden="true"
        >
          {userInitial}
        </div>
        <div className="user-info">
          <h3 className="user-name" id={`user-${user._id}`}>
            {user.fullName}
          </h3>
          <p className="user-title">{user.designation}</p>
          <p className="user-company">{user.company}</p>
          <p className="user-email">{user.email}</p>
        </div>
      </div>

      <div className="user-actions">
        <UserActionButtons
          userId={user._id}
          status={status}
          actionLoading={actionLoading}
          {...actions}
        />
      </div>
    </div>
  );
};

// Main component
function ConnectionsPage() {
  const { user, logout } = useAuth();
  const {
    users,
    loading,
    error,
    userConnectionStatuses,
    actionLoading,
    refreshing,
    fetchData,
    refresh,
    updateState,
    getAuthHeaders,
  } = useConnectionData(user, logout);

  // Memoized computed values
  const networkStats = useMemo(() => {
    const statuses = Object.values(userConnectionStatuses);
    return {
      connections: statuses.filter(
        (s) => s.status === CONNECTION_STATUSES.ACCEPTED
      ).length,
      pendingReceived: statuses.filter(
        (s) => s.status === CONNECTION_STATUSES.PENDING_RECEIVED
      ).length,
      pendingSent: statuses.filter(
        (s) => s.status === CONNECTION_STATUSES.PENDING_SENT
      ).length,
    };
  }, [userConnectionStatuses]);

  const suggestedUsers = useMemo(() => {
    return users
      .filter((u) => {
        const status = userConnectionStatuses[u._id]?.status;
        return (
          status === CONNECTION_STATUSES.NOT_CONNECTED ||
          status === CONNECTION_STATUSES.DECLINED
        );
      })
      .slice(0, 3);
  }, [users, userConnectionStatuses]);

  // Action handlers with better error handling
  const createActionHandler = useCallback(
    (action, endpoint, successMessage) => {
      return async (userId, additionalData = {}) => {
        const headers = getAuthHeaders();
        if (!headers) {
          alert("Session expired. Please log in again.");
          logout();
          return;
        }

        updateState((prev) => ({
          actionLoading: { ...prev.actionLoading, [userId]: true },
        }));

        try {
          await axios[action.method || "post"](
            typeof endpoint === "function" ? endpoint(userId) : endpoint,
            additionalData,
            { headers }
          );

          if (action.updateStatus) {
            updateState((prev) => ({
              userConnectionStatuses: {
                ...prev.userConnectionStatuses,
                [userId]: action.updateStatus(
                  prev.userConnectionStatuses[userId]
                ),
              },
            }));
          }

          alert(successMessage);
          await fetchData();
        } catch (err) {
          console.error(`Error in ${action.name}:`, err);
          const errorMessage = err.response?.data?.message || err.message;

          if (err.response?.status === 401) {
            alert("Session expired. Please log in again.");
            logout();
          } else {
            alert(`Failed to ${action.name.toLowerCase()}: ${errorMessage}`);
            await fetchData();
          }
        } finally {
          updateState((prev) => {
            const newActionLoading = { ...prev.actionLoading };
            delete newActionLoading[userId];
            return { actionLoading: newActionLoading };
          });
        }
      };
    },
    [getAuthHeaders, logout, updateState, fetchData]
  );

  // Connection action handlers
  const handleConnect = createActionHandler(
    {
      name: "Connect",
      method: "post",
      updateStatus: () => ({
        status: CONNECTION_STATUSES.PENDING_SENT,
        requestId: null,
      }),
    },
    API_ENDPOINTS.CONNECTIONS,
    "Connection request sent successfully!"
  );

  const handleAcceptRequest = createActionHandler(
    {
      name: "Accept Request",
      method: "put",
      updateStatus: (current) => ({
        ...current,
        status: CONNECTION_STATUSES.ACCEPTED,
      }),
    },
    (userId) => {
      const requestId = userConnectionStatuses[userId]?.requestId;
      return `${API_ENDPOINTS.CONNECTIONS}/${requestId}/accept`;
    },
    "Connection request accepted!"
  );

  const handleDeclineRequest = createActionHandler(
    {
      name: "Decline Request",
      method: "put",
      updateStatus: () => ({
        status: CONNECTION_STATUSES.DECLINED,
        requestId: null,
      }),
    },
    (userId) => {
      const requestId = userConnectionStatuses[userId]?.requestId;
      return `${API_ENDPOINTS.CONNECTIONS}/${requestId}/decline`;
    },
    "Connection request declined!"
  );

  const handleCancelRequest = createActionHandler(
    {
      name: "Cancel Request",
      method: "delete",
      updateStatus: () => ({
        status: CONNECTION_STATUSES.NOT_CONNECTED,
        requestId: null,
      }),
    },
    (userId) => {
      const requestId = userConnectionStatuses[userId]?.requestId;
      return `${API_ENDPOINTS.CONNECTIONS}/${requestId}`;
    },
    "Connection request cancelled!"
  );

  const handleRemoveConnection = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this connection?")) {
      return;
    }

    const actionHandler = createActionHandler(
      {
        name: "Remove Connection",
        method: "delete",
        updateStatus: () => ({
          status: CONNECTION_STATUSES.NOT_CONNECTED,
          requestId: null,
        }),
      },
      (userId) => {
        const requestId = userConnectionStatuses[userId]?.requestId;
        return `${API_ENDPOINTS.CONNECTIONS}/${requestId}/remove`;
      },
      "Connection removed successfully!"
    );

    await actionHandler(userId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner" role="status" aria-live="polite">
          <div className="spinner"></div>
          <p>Loading connections data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container">
        <div className="error-message" role="alert">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={refresh} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const userActions = {
    onConnect: (userId) => handleConnect(userId, { receiverId: userId }),
    onAccept: handleAcceptRequest,
    onDecline: handleDeclineRequest,
    onCancel: handleCancelRequest,
    onRemove: handleRemoveConnection,
  };

  return (
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
          <Link
            to="/settings"
            className="header-icon-link"
            aria-label="Settings"
          >
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
                  aria-hidden="true"
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
              {user?.role === "admin" && (
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
                onClick={refresh}
                className="nav-link refresh-btn"
                disabled={refreshing}
                aria-label={refreshing ? "Refreshing data" : "Refresh data"}
              >
                {refreshing ? "🔄 Refreshing..." : "🔄 Refresh Data"}
              </button>
            </nav>
          </div>

          <div className="sidebar-card">
            <h3 className="card-title">Network Stats</h3>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-number">{networkStats.connections}</span>
                <span className="stat-label">Connections</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {networkStats.pendingReceived}
                </span>
                <span className="stat-label">Pending Requests</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{networkStats.pendingSent}</span>
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
                <div className="empty-icon" aria-hidden="true">
                  👥
                </div>
                <h3>No users found</h3>
                <p>Check back later for new connection opportunities.</p>
              </div>
            ) : (
              <div className="users-grid" role="grid">
                {users.map((userItem) => {
                  const userStatus =
                    userConnectionStatuses[userItem._id]?.status ||
                    CONNECTION_STATUSES.NOT_CONNECTED;

                  return (
                    <div key={userItem._id} className="user-profile-card">
                      {userItem.profilePic && (
                        <img
                          src={userItem.profilePic}
                          alt={`${userItem.fullName}'s profile`}
                          className="user-avatar"
                        />
                      )}

                      {userItem.fullName && <h3>{userItem.fullName}</h3>}

                      {userItem.company && (
                        <p>
                          <strong>Company:</strong> {userItem.company}
                        </p>
                      )}
                      {userItem.designation && (
                        <p>
                          <strong>Designation:</strong> {userItem.designation}
                        </p>
                      )}
                      {userItem.role && (
                        <p>
                          <strong>Position:</strong> {userItem.role}
                        </p>
                      )}

                      {userItem.linkedin && (
                        <p>
                          <strong>LinkedIn:</strong>{" "}
                          <a
                            href={userItem.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {userItem.linkedin}
                          </a>
                        </p>
                      )}

                      {userItem.yearsOfFinanceExperience && (
                        <p>
                          <strong>Experience:</strong>{" "}
                          {userItem.yearsOfFinanceExperience} years
                        </p>
                      )}

                      {userItem.financialCertifications?.length > 0 && (
                        <p>
                          <strong>Certifications:</strong>{" "}
                          {userItem.financialCertifications.join(", ")}
                        </p>
                      )}

                      {userItem.industrySpecializations?.length > 0 && (
                        <p>
                          <strong>Industries:</strong>{" "}
                          {userItem.industrySpecializations.join(", ")}
                        </p>
                      )}

                      {userItem.keyFinancialSkills?.length > 0 && (
                        <p>
                          <strong>Skills:</strong>{" "}
                          {userItem.keyFinancialSkills.join(", ")}
                        </p>
                      )}

                      {userItem.budgetManaged && (
                        <p>
                          <strong>Budget:</strong> {userItem.budgetManaged}
                        </p>
                      )}

                      {typeof userItem.isVerified === "boolean" && (
                        <p>
                          <strong>Verified:</strong>{" "}
                          {userItem.isVerified ? "Yes" : "No"}
                        </p>
                      )}

                      <p>
                        <strong>Status:</strong> {userStatus}
                      </p>

                      {userItem.createdAt && (
                        <small>
                          <strong>Joined:</strong>{" "}
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </small>
                      )}

                      <div className="user-card-actions">
                        <UserActionButtons
                          userId={userItem._id}
                          status={userStatus}
                          actionLoading={actionLoading}
                          {...userActions}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <aside className="right-sidebar">
          <div className="sidebar-card">
            <h3 className="card-title">Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon" aria-hidden="true">
                  🔔
                </div>
                <div className="activity-content">
                  <p>
                    You have {networkStats.pendingReceived} pending connection
                    requests
                  </p>
                  <span className="activity-time">Now</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon" aria-hidden="true">
                  ✅
                </div>
                <div className="activity-content">
                  <p>
                    You're connected with {networkStats.connections}{" "}
                    professionals
                  </p>
                  <span className="activity-time">Today</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon" aria-hidden="true">
                  📤
                </div>
                <div className="activity-content">
                  <p>You sent {networkStats.pendingSent} connection requests</p>
                  <span className="activity-time">Recent</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="card-title">People You May Know</h3>
            <div className="suggestions">
              {suggestedUsers.map((suggestedUser) => (
                <div key={suggestedUser._id} className="suggestion-item">
                  <div className="suggestion-info">
                    <h4>{suggestedUser.fullName}</h4>
                    <p>{suggestedUser.designation}</p>
                  </div>
                  <button
                    className="btn-small btn-connect"
                    onClick={() =>
                      handleConnect(suggestedUser._id, {
                        receiverId: suggestedUser._id,
                      })
                    }
                    disabled={actionLoading[suggestedUser._id]}
                    aria-label={`Connect with ${suggestedUser.fullName}`}
                  >
                    {actionLoading[suggestedUser._id] ? "..." : "Connect"}
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
  );
}

export default ConnectionsPage;
