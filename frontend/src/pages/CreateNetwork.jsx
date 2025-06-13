import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext"; // Adjusted path to '../context/AuthContext'
import { useNavigate } from "react-router-dom";
import ConnectionsHeader from "../components/ConnectionsHeader"; // Adjusted path to '../components/ConnectionsHeader'
import Footer from "../components/Footer"; // Adjusted path to '../components/Footer'
import "../styles/CreateNetwork.css"; // Adjusted path to '../styles/CreateNetwork.css'

const CreateNetwork = () => {
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionActionLoading, setConnectionActionLoading] = useState({});

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Memoized function to get authorization headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  // Function to fetch all potential connections
  const fetchAllConnections = useCallback(async () => {
    setLoading(true);
    setError(null);

    const headers = getAuthHeaders();
    if (!headers) {
      toast.error("Please log in to view and create network.");
      setLoading(false);
      logout(); // Redirects to login if no token
      return;
    }

    try {
      const res = await axios.get("/api/v1/connections/all-users", { headers });

      // Check if data is valid and an array
      if (!res.data.data || !Array.isArray(res.data.data)) {
        toast.error("Something went wrong while fetching connections or data format is incorrect.");
        setNetwork([]);
        return;
      }

      setNetwork(res.data.data);
      // Removed success toast here to avoid overwhelming the user on initial load
    } catch (error) {
      console.error("Error fetching connections:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch connections.";
      setError(errorMessage);
      toast.error(errorMessage);

      // Handle unauthorized or forbidden errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout(); // Logs out and redirects if token is invalid/expired
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, logout]); // Dependencies for useCallback

  // Handler for connection actions (connect, accept, remove, cancel, decline)
  const handleConnectionAction = useCallback(
    async (targetUserId, action, connectionId = null) => {
      setConnectionActionLoading((prev) => ({ ...prev, [targetUserId]: true })); // Set loading state for specific user

      const headers = getAuthHeaders();
      if (!headers) {
        toast.error("Please log in to perform connection actions.");
        setConnectionActionLoading((prev) => ({ ...prev, [targetUserId]: false }));
        return;
      }

      try {
        let message;
        // Perform API call based on the action
        switch (action) {
          case "connect":
            await axios.post("/api/v1/connections", { receiverId: targetUserId }, { headers });
            message = "Connection request sent!";
            break;

          case "accept":
            if (!connectionId) throw new Error("Connection ID is required to accept request.");
            await axios.put(`/api/v1/connections/${connectionId}/accept`, {}, { headers });
            message = "Connection request accepted!";
            break;

          case "remove":
            if (!connectionId) throw new Error("Connection ID is required to remove connection.");
            await axios.delete(`/api/v1/connections/${connectionId}/remove`, { headers });
            message = "Connection removed.";
            break;

          case "cancel":
            if (!connectionId) throw new Error("Connection ID is required to cancel request.");
            await axios.delete(`/api/v1/connections/${connectionId}`, { headers });
            message = "Connection request cancelled.";
            break;

          case "decline":
            if (!connectionId) throw new Error("Connection ID is required to decline request.");
            await axios.put(`/api/v1/connections/${connectionId}/decline`, {}, { headers });
            message = "Connection request declined.";
            break;

          default:
            console.warn("Unknown connection action:", action);
            return;
        }

        toast.success(message);
        fetchAllConnections(); // Re-fetch connections to update UI
      } catch (error) {
        console.error("Error performing connection action:", error);
        const errorMessage = error.response?.data?.message || `Failed to perform connection action: ${action}`;
        toast.error(errorMessage);
      } finally {
        setConnectionActionLoading((prev) => ({ ...prev, [targetUserId]: false })); // Reset loading state
      }
    },
    [getAuthHeaders, fetchAllConnections] // Dependencies for useCallback
  );

  // Fetch connections on component mount
  useEffect(() => {
    fetchAllConnections();
  }, [fetchAllConnections]);

  // Helper function to render connection action buttons based on status
  const renderConnectionButtons = (conn) => {
    const isLoading = connectionActionLoading[conn._id]; // Check loading state for specific user

    switch (conn.connectionStatus) {
      case "not_connected":
        return (
          <button
            onClick={() => handleConnectionAction(conn._id, "connect")}
            className="btn btn-primary"
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        );

      case "pending_sent":
        return (
          <>
            <button className="btn btn-secondary" disabled>
              Request Sent
            </button>
            {conn.connectionId && ( // Ensure connectionId exists before rendering cancel button
              <button
                onClick={() => handleConnectionAction(conn._id, "cancel", conn.connectionId)}
                className="btn btn-danger"
                disabled={isLoading}
              >
                {isLoading ? "Cancelling..." : "Cancel Request"}
              </button>
            )}
          </>
        );

      case "pending_received":
        return (
          <>
            <button
              onClick={() => handleConnectionAction(conn._id, "accept", conn.connectionId)}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Accepting..." : "Accept Request"}
            </button>
            <button
              onClick={() => handleConnectionAction(conn._id, "decline", conn.connectionId)}
              className="btn btn-danger"
              disabled={isLoading}
            >
              {isLoading ? "Declining..." : "Decline"}
            </button>
          </>
        );

      case "connected":
        return (
          <>
            <button className="btn btn-success" disabled>
              Connected ✔️
            </button>
            {conn.connectionId && ( // Ensure connectionId exists before rendering remove button
              <button
                onClick={() => handleConnectionAction(conn._id, "remove", conn.connectionId)}
                className="btn btn-danger"
                disabled={isLoading}
              >
                {isLoading ? "Removing..." : "Remove Connection"}
              </button>
            )}
          </>
        );

      default:
        // Default case for any unhandled status or initial render without status
        return (
          <button
            onClick={() => handleConnectionAction(conn._id, "connect")}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        );
    }
  };

  // --- Render based on loading/error/empty states ---
  if (loading) {
    return (
      <>
        <ConnectionsHeader />
        <div className="network-container status-state loading-state">
          <div className="loading-spinner" role="status" aria-live="polite">
            <div className="spinner"></div>
            <p>Loading potential connections...</p>
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
        <div className="network-container status-state error-state">
          <div className="error-message" role="alert">
            <h2>Error Fetching Connections</h2>
            <p>{error}</p>
            <button onClick={fetchAllConnections} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (network.length === 0) {
    return (
      <>
        <ConnectionsHeader />
        <div className="network-container status-state empty-state">
          <div className="empty-icon" aria-hidden="true">
            👥
          </div>
          <h3>No New Connections Found</h3>
          <p>It seems there are no new users to connect with at the moment. Try again later!</p>
        </div>
        <Footer />
      </>
    );
  }

  // --- Main content render ---
  return (
    <>
      <ConnectionsHeader />
      <div className="network-container">
        <h2>Discover New Connections</h2>
        <div className="connections-grid">
          {network.map((conn) => (
            <div key={conn._id} className="connection-card">
              <div className="card-header">
                {conn.profilePic ? (
                  <img
                    src={conn.profilePic}
                    alt={`${conn.fullName}'s profile`}
                    className="connection-avatar"
                    // Fallback for broken images: hide img and show placeholder
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.style.display = "flex";
                      }
                    }}
                  />
                ) : (
                  <div className="connection-avatar-placeholder">
                    {conn.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <h3 className="connection-name">{conn.fullName}</h3>
              </div>
              <div className="card-details">
                {conn.designation && (
                  <p className="connection-designation">{conn.designation}</p>
                )}
                {conn.company && (
                  <p className="connection-company">at {conn.company}</p>
                )}
                {/* <p className="connection-status">
                  Status: {conn.connectionStatus || "not_connected"}
                </p> */}
                {/* Removed status line to shorten card, status implied by buttons */}
              </div>
              <div className="card-actions">
                {renderConnectionButtons(conn)}
                <button
                  onClick={() => navigate(`/profile/${conn._id}`)}
                  className="btn btn-outline"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer /> {/* Render the Footer component */}
    </>
  );
};

export default CreateNetwork;
