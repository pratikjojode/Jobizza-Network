import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ManageConnection.css";
import ConnectionDetailsModal from "../components/ConnectionDetailsModal.jsx";

const ManageConnection = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [selectedConnectionIds, setSelectedConnectionIds] = useState([]);

  const compareUserIds = (id1, id2) => {
    if (!id1 || !id2) return false;
    const str1 =
      typeof id1 === "object" ? id1._id || id1.toString() : String(id1);
    const str2 =
      typeof id2 === "object" ? id2._id || id2.toString() : String(id2);
    return str1 === str2;
  };

  const getUserId = (user) => {
    if (!user) return null;
    return typeof user === "object" ? user._id : String(user);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const base64Url = storedToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedToken = JSON.parse(window.atob(base64));
        setLoggedInUserId(decodedToken.id);
      } catch (e) {
        console.error("Failed to decode token:", e);
        setLoggedInUserId(null);
      }
    }

    const fetchConnections = async () => {
      try {
        if (!storedToken) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/v1/connections", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.data && Array.isArray(response.data.data)) {
          setConnections(response.data.data);
        } else {
          setConnections([]);
          setError("Unexpected data format from API.");
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          setError(
            "Access Denied. You might not have proper authorization to view all connections or your token is invalid/expired."
          );
        } else {
          setError(
            err.response?.data?.message || "Failed to fetch connections."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const refreshConnections = async () => {
    setLoading(true);
    setError(null);
    setSelectedConnectionIds([]);
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/v1/connections", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      if (response.data && Array.isArray(response.data.data)) {
        setConnections(response.data.data);
      } else {
        setConnections([]);
        setError("Unexpected data format on refresh.");
      }
    } catch (err) {
      console.error("Error refreshing connections:", err);
      setError(err.response?.data?.message || "Failed to refresh connections.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to accept this connection request?"
      )
    )
      return;
    const storedToken = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/v1/connections/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      alert("Connection request accepted!");
      refreshConnections();
    } catch (err) {
      alert(
        `Failed to accept: ${
          err.response?.data?.message || err.message
        }. You must be the receiver of this pending request to accept.`
      );
      console.error("Error accepting connection:", err);
    }
  };

  const handleDecline = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to decline this connection request?"
      )
    )
      return;
    const storedToken = localStorage.getItem("token");
    try {
      await axios.put(
        `/api/v1/connections/${id}/decline`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      alert("Connection request declined!");
      refreshConnections();
    } catch (err) {
      alert(
        `Failed to decline: ${
          err.response?.data?.message || err.message
        }. You must be the receiver of this pending request to decline.`
      );
      console.error("Error declining connection:", err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this sent request?"))
      return;
    const storedToken = localStorage.getItem("token");
    try {
      await axios.delete(`/api/v1/connections/${id}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      alert("Connection request canceled!");
      refreshConnections();
    } catch (err) {
      alert(
        `Failed to cancel: ${
          err.response?.data?.message || err.message
        }. You must be the sender of this pending request to cancel.`
      );
      console.error("Error canceling connection:", err);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this connection?"))
      return;
    const storedToken = localStorage.getItem("token");
    try {
      await axios.delete(`/api/v1/connections/${id}/remove`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      alert("Connection removed!");
      refreshConnections();
    } catch (err) {
      alert(
        `Failed to remove: ${
          err.response?.data?.message || err.message
        }. You must be either the sender or receiver of this accepted connection to remove.`
      );
      console.error("Error removing connection:", err);
    }
  };

  const handleView = (connection) => {
    setSelectedConnection(connection);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "WARNING: Are you sure you want to permanently DELETE this connection? This action cannot be undone."
      )
    )
      return;
    const storedToken = localStorage.getItem("token");
    try {
      await axios.delete(`/api/v1/connections/${id}/delete-permanent`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      alert("Connection permanently deleted!");
      refreshConnections();
    } catch (err) {
      alert(
        `Failed to delete: ${
          err.response?.data?.message || err.message
        }. You might not have the necessary permissions.`
      );
      console.error("Error deleting connection:", err);
    }
  };

  const handleBlock = async (userIdToBlock) => {
    if (
      !window.confirm(
        `Are you sure you want to BLOCK user ${userIdToBlock}? This will prevent further interactions.`
      )
    )
      return;
    const storedToken = localStorage.getItem("token");
    try {
      await axios.post(
        `/api/v1/users/${userIdToBlock}/block`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      alert(`User ${userIdToBlock} blocked!`);
      refreshConnections();
    } catch (err) {
      alert(
        `Failed to block user: ${err.response?.data?.message || err.message}.`
      );
      console.error("Error blocking user:", err);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "table" ? "card" : "table"));
  };

  const handleCheckboxChange = (connectionId) => {
    setSelectedConnectionIds((prevSelected) =>
      prevSelected.includes(connectionId)
        ? prevSelected.filter((id) => id !== connectionId)
        : [...prevSelected, connectionId]
    );
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      const allConnectionIds = connections.map((conn) => conn._id);
      setSelectedConnectionIds(allConnectionIds);
    } else {
      setSelectedConnectionIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConnectionIds.length === 0) {
      alert("Please select connections to delete.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently DELETE ${selectedConnectionIds.length} selected connections? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    const storedToken = localStorage.getItem("token");

    try {
      await axios.post(
        `/api/v1/connections/bulk-delete`,
        { ids: selectedConnectionIds },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );
      alert(`${selectedConnectionIds.length} connections permanently deleted!`);
      refreshConnections();
    } catch (err) {
      console.error("Error bulk deleting connections:", err);
      alert(
        `Failed to bulk delete connections: ${
          err.response?.data?.message || err.message
        }.`
      );
    } finally {
      setLoading(false);
      setSelectedConnectionIds([]);
    }
  };

  const exportConnectionsToCsv = () => {
    if (connections.length === 0) {
      alert("No connections to export.");
      return;
    }

    const headers = [
      "ID",
      "Sender ID",
      "Sender FullName",
      "Sender Email",
      "Receiver ID",
      "Receiver FullName",
      "Receiver Email",
      "Status",
      "Created At",
      "Updated At",
    ];

    const rows = connections.map((conn) => [
      conn._id,
      conn.sender?._id || String(conn.sender),
      conn.sender?.fullName || "N/A",
      conn.sender?.email || "N/A",
      conn.receiver?._id || String(conn.receiver),
      conn.receiver?.fullName || "N/A",
      conn.receiver?.email || "N/A",
      conn.status,
      new Date(conn.createdAt).toLocaleString(),
      new Date(conn.updatedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "connections.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Your browser does not support downloading CSV files directly.");
    }
  };

  if (loading) {
    return <div className="loading-message">Loading connections...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="manage-connections-container">
      <div className="manage-connections-header">
        <h2>Manage All Connections ({connections.length})</h2>
        <div className="action-buttons">
          <button onClick={refreshConnections} className="refresh-btn">
            Refresh
          </button>
          <button onClick={toggleViewMode} className="toggle-view-btn">
            {viewMode === "table" ? "Show Card View" : "Show Table View"}
          </button>
          <button onClick={exportConnectionsToCsv} className="export-csv-btn">
            Export to CSV
          </button>
          <button
            onClick={handleBulkDelete}
            className="bulk-delete-btn"
            disabled={selectedConnectionIds.length === 0}
          >
            Delete Selected ({selectedConnectionIds.length})
          </button>
        </div>
      </div>

      {connections.length === 0 ? (
        <p className="no-connections-message">No connections found.</p>
      ) : (
        <>
          {viewMode === "table" ? (
            <div className="table-container">
              <table className="connections-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAllChange}
                        checked={
                          selectedConnectionIds.length === connections.length &&
                          connections.length > 0
                        }
                        title="Select All"
                      />
                    </th>
                    <th>ID</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((connection) => (
                    <tr
                      key={connection._id}
                      className={
                        selectedConnectionIds.includes(connection._id)
                          ? "selected-row"
                          : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedConnectionIds.includes(
                            connection._id
                          )}
                          onChange={() => handleCheckboxChange(connection._id)}
                        />
                      </td>
                      <td data-label="ID" title={connection._id}>
                        {connection._id.substring(0, 8)}...
                      </td>
                      <td data-label="Sender">
                        <div className="user-info">
                          <strong>
                            {connection.sender?.fullName || "N/A"}
                          </strong>
                          <small>{connection.sender?.email || "N/A"}</small>
                          <small className="user-id">
                            ID:{" "}
                            {connection.sender?._id?.substring(0, 8) || "N/A"}
                            ...
                          </small>
                        </div>
                      </td>
                      <td data-label="Receiver">
                        <div className="user-info">
                          <strong>
                            {connection.receiver?.fullName || "N/A"}
                          </strong>
                          <small>{connection.receiver?.email || "N/A"}</small>
                          <small className="user-id">
                            ID:{" "}
                            {connection.receiver?._id?.substring(0, 8) || "N/A"}
                            ...
                          </small>
                        </div>
                      </td>
                      <td data-label="Status">
                        <span
                          className={`status-badge status-${connection.status}`}
                        >
                          {connection.status}
                        </span>
                      </td>
                      <td data-label="Created At">
                        {new Date(connection.createdAt).toLocaleDateString()}
                        <small>
                          {new Date(connection.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td data-label="Updated At">
                        {new Date(connection.updatedAt).toLocaleDateString()}
                        <small>
                          {new Date(connection.updatedAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons-cell">
                          {connection.status === "pending" && (
                            <>
                              {compareUserIds(
                                loggedInUserId,
                                getUserId(connection.receiver)
                              ) && (
                                <>
                                  <button
                                    onClick={() => handleAccept(connection._id)}
                                    className="accept-btn"
                                    title="Accept connection request"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDecline(connection._id)
                                    }
                                    className="decline-btn"
                                    title="Decline connection request"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                              {compareUserIds(
                                loggedInUserId,
                                getUserId(connection.sender)
                              ) && (
                                <button
                                  onClick={() => handleCancel(connection._id)}
                                  className="cancel-btn"
                                  title="Cancel sent request"
                                >
                                  Cancel
                                </button>
                              )}
                            </>
                          )}
                          {connection.status === "accepted" &&
                            (compareUserIds(
                              loggedInUserId,
                              getUserId(connection.sender)
                            ) ||
                              compareUserIds(
                                loggedInUserId,
                                getUserId(connection.receiver)
                              )) && (
                              <button
                                onClick={() => handleRemove(connection._id)}
                                className="remove-btn"
                                title="Remove connection"
                              >
                                Remove
                              </button>
                            )}

                          <button
                            onClick={() => handleView(connection)}
                            className="view-btn"
                            title="View details"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleDelete(connection._id)}
                            className="delete-btn"
                            title="Permanently delete"
                          >
                            Delete
                          </button>

                          {loggedInUserId && (
                            <>
                              {compareUserIds(
                                loggedInUserId,
                                getUserId(connection.sender)
                              ) && (
                                <button
                                  onClick={() =>
                                    handleBlock(getUserId(connection.receiver))
                                  }
                                  className="block-btn"
                                  title={`Block ${
                                    connection.receiver?.fullName || "Receiver"
                                  }`}
                                >
                                  Block Receiver
                                </button>
                              )}
                              {compareUserIds(
                                loggedInUserId,
                                getUserId(connection.receiver)
                              ) && (
                                <button
                                  onClick={() =>
                                    handleBlock(getUserId(connection.sender))
                                  }
                                  className="block-btn"
                                  title={`Block ${
                                    connection.sender?.fullName || "Sender"
                                  }`}
                                >
                                  Block Sender
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="connection-cards-container">
              {connections.map((connection) => (
                <div
                  key={connection._id}
                  className={`connection-card ${
                    selectedConnectionIds.includes(connection._id)
                      ? "selected-card"
                      : ""
                  }`}
                >
                  <div className="card-header">
                    <input
                      type="checkbox"
                      checked={selectedConnectionIds.includes(connection._id)}
                      onChange={() => handleCheckboxChange(connection._id)}
                    />
                    <h3 title={connection._id}>
                      Connection: {connection._id.substring(0, 12)}...
                    </h3>
                    <span className={`card-status status-${connection.status}`}>
                      {connection.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="user-section">
                      <h4>Sender:</h4>
                      <p>
                        <strong>{connection.sender?.fullName || "N/A"}</strong>
                      </p>
                      <p>
                        <small>{connection.sender?.email || "N/A"}</small>
                      </p>
                      <p>
                        <small>
                          ID:{" "}
                          {connection.sender?._id?.substring(0, 12) || "N/A"}...
                        </small>
                      </p>
                    </div>
                    <div className="user-section">
                      <h4>Receiver:</h4>
                      <p>
                        <strong>
                          {connection.receiver?.fullName || "N/A"}
                        </strong>
                      </p>
                      <p>
                        <small>{connection.receiver?.email || "N/A"}</small>
                      </p>
                      <p>
                        <small>
                          ID:{" "}
                          {connection.receiver?._id?.substring(0, 12) || "N/A"}
                          ...
                        </small>
                      </p>
                    </div>
                    <div className="date-section">
                      <p>
                        <strong>Created:</strong>{" "}
                        {new Date(connection.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <strong>Last Updated:</strong>{" "}
                        {new Date(connection.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="card-actions">
                    {connection.status === "pending" && (
                      <>
                        {compareUserIds(
                          loggedInUserId,
                          getUserId(connection.receiver)
                        ) && (
                          <>
                            <button
                              onClick={() => handleAccept(connection._id)}
                              className="accept-btn"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(connection._id)}
                              className="decline-btn"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {compareUserIds(
                          loggedInUserId,
                          getUserId(connection.sender)
                        ) && (
                          <button
                            onClick={() => handleCancel(connection._id)}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                    {connection.status === "accepted" &&
                      (compareUserIds(
                        loggedInUserId,
                        getUserId(connection.sender)
                      ) ||
                        compareUserIds(
                          loggedInUserId,
                          getUserId(connection.receiver)
                        )) && (
                        <button
                          onClick={() => handleRemove(connection._id)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      )}

                    <button
                      onClick={() => handleView(connection)}
                      className="view-btn"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleDelete(connection._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>

                    {loggedInUserId && (
                      <>
                        {compareUserIds(
                          loggedInUserId,
                          getUserId(connection.sender)
                        ) && (
                          <button
                            onClick={() =>
                              handleBlock(getUserId(connection.receiver))
                            }
                            className="block-btn"
                          >
                            Block {connection.receiver?.fullName || "Receiver"}
                          </button>
                        )}
                        {compareUserIds(
                          loggedInUserId,
                          getUserId(connection.receiver)
                        ) && (
                          <button
                            onClick={() =>
                              handleBlock(getUserId(connection.sender))
                            }
                            className="block-btn"
                          >
                            Block {connection.sender?.fullName || "Sender"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && selectedConnection && (
        <ConnectionDetailsModal
          connection={selectedConnection}
          onClose={() => {
            setShowModal(false);
            setSelectedConnection(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageConnection;
