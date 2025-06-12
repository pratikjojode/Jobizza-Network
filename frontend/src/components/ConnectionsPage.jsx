import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/ConnectionsPage.css";
import ConnectionsHeader from "./ConnectionsHeader";

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
  MY_OWN_PROFILE: "/api/v1/connections/me",
};

const useConnectionData = (user, logout) => {
  const [state, setState] = useState({
    users: [],
    loading: true,
    error: null,
    userConnectionStatuses: {},
    actionLoading: {},
    refreshing: false,
    // Add state for the authenticated user's full profile data
    currentUserFullProfile: null,
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
        // Fetch the authenticated user's own full profile
        myProfileResponse,
      ] = await Promise.all([
        axios.get(API_ENDPOINTS.ALL_USERS, { headers }),
        axios.get(API_ENDPOINTS.MY_CONNECTIONS, { headers }),
        axios.get(API_ENDPOINTS.SENT_PENDING, { headers }),
        axios.get(API_ENDPOINTS.RECEIVED_PENDING, { headers }),
        // Perform the new API call
        axios.get(API_ENDPOINTS.MY_OWN_PROFILE, { headers }),
      ]);

      const allUsers = usersResponse.data.data || [];
      const filteredUsers = allUsers.filter(
        (u) => String(u._id) !== String(user.id)
      );

      const currentConnections = connectionsResponse.data.data || [];
      const sentPendingRequests = sentPendingResponse.data.data || [];
      const receivedPendingRequests = receivedPendingResponse.data.data || [];
      // Extract the full profile data for the current user
      const currentUserFullProfile = myProfileResponse.data.data.user || null;

      const statusMap = filteredUsers.reduce((acc, u) => {
        acc[String(u._id)] = {
          status: CONNECTION_STATUSES.NOT_CONNECTED,
          requestId: null,
        };
        return acc;
      }, {});

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
        currentUserFullProfile: currentUserFullProfile, // Set the fetched profile
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

const UserCard = ({ user, status, actionLoading, actions }) => {
  const userInitial = user.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className="user-card"
      role="article"
      aria-labelledby={`user-${user._id}`}
    >
      <div className="user-card-header">
        <Link to={`/profile/${user._id}`} className="user-profile-link">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={`${user.fullName}'s profile`}
              className="user-avatar"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className="user-avatar-placeholder"
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
          <div className="user-info-text">
            <h3 className="user-name" id={`user-${user._id}`}>
              {user.fullName}
            </h3>
            {user.designation && (
              <p className="user-detail user-designation">{user.designation}</p>
            )}
            {user.company && (
              <p className="user-detail user-company">{user.company}</p>
            )}
          </div>
        </Link>
      </div>

      <div className="user-card-body">
        {user.yearsOfFinanceExperience && (
          <p className="user-detail">
            <strong>Experience:</strong> {user.yearsOfFinanceExperience} years
          </p>
        )}
        {user.financialCertifications?.length > 0 && (
          <p className="user-detail">
            <strong>Certifications:</strong>{" "}
            {user.financialCertifications.join(", ")}
          </p>
        )}
        {user.industrySpecializations?.length > 0 && (
          <p className="user-detail">
            <strong>Industries:</strong>{" "}
            {user.industrySpecializations.join(", ")}
          </p>
        )}
        {user.keyFinancialSkills?.length > 0 && (
          <p className="user-detail">
            <strong>Skills:</strong> {user.keyFinancialSkills.join(", ")}
          </p>
        )}
        {user.budgetManaged && (
          <p className="user-detail">
            <strong>Budget Managed:</strong> {user.budgetManaged}
          </p>
        )}
        {user.linkedin && (
          <p className="user-detail user-linkedin">
            <a
              href={user.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin-link"
              aria-label={`LinkedIn profile of ${user.fullName}`}
            >
              LinkedIn Profile
            </a>
          </p>
        )}
        {typeof user.isVerified === "boolean" && (
          <p className="user-detail">
            <strong>Verified:</strong> {user.isVerified ? "Yes ✅" : "No ❌"}
          </p>
        )}
      </div>

      <div className="user-card-actions-footer">
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

function ConnectionsPage() {
  const { user, logout } = useAuth(); // 'user' from AuthContext typically holds basic user info (id, name, email)
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
    currentUserFullProfile, // Get the newly fetched full profile
  } = useConnectionData(user, logout);

  // Use the full profile data for the sidebar if available, otherwise fallback to basic user data
  const displayedUser = currentUserFullProfile || user;

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
    return users.filter((u) => {
      const status = userConnectionStatuses[u._id]?.status;
      return (
        status === CONNECTION_STATUSES.NOT_CONNECTED ||
        status === CONNECTION_STATUSES.DECLINED
      );
    });
  }, [users, userConnectionStatuses]);

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
      <ConnectionsHeader />

      <div className="main-layout">
        <aside className="left-sidebar">
          <div className="sidebar-card">
            <div className="profile-summary">
              {/* Use displayedUser for profile details in the sidebar */}
              {displayedUser?.profilePic ? (
                <img
                  src={displayedUser.profilePic}
                  alt={`${displayedUser.fullName}'s profile`}
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = "flex";
                    }
                  }}
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
                  {displayedUser?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="profile-info">
                <h3>{displayedUser?.fullName}</h3>
                <p className="profile-title">
                  {displayedUser?.designation || "Professional"}
                </p>
                <p className="profile-company">{displayedUser?.company}</p>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="card-title">Quick Actions</h3>
            <nav className="quick-nav">
              <Link to="/my-connections" className="nav-link">
                📋 Manage My Requests
              </Link>
              {displayedUser?.role === "admin" && ( // Use displayedUser for role check
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
                    <UserCard
                      key={userItem._id}
                      user={userItem}
                      status={userStatus}
                      actionLoading={actionLoading}
                      actions={userActions}
                    />
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
              {suggestedUsers.length === 0 ? (
                <p className="no-suggestions">
                  No new suggestions at the moment.
                </p>
              ) : (
                suggestedUsers.map((suggestedUser) => (
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
                ))
              )}
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
