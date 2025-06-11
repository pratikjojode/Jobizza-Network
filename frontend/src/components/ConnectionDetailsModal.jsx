import React from "react";
import "../styles/ConnectionDetailsModal.css";

const ConnectionDetailsModal = ({ connection, onClose }) => {
  if (!connection) {
    return null; // Don't render if no connection is provided
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {" "}
        <div className="modal-header">
          <h2>Connection Details</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>
            <strong>Connection ID:</strong> {connection._id}
          </p>
          <div className="modal-section">
            <h3>Sender Details</h3>
            <p>
              <strong>Name:</strong> {connection.sender?.fullName || "N/A"}
            </p>
            <p>
              <strong>Sender ID:</strong>{" "}
              {connection.sender?._id || String(connection.sender) || "N/A"}
            </p>
            {/* Add more sender details if available in connection.sender object */}
            {connection.sender?.email && (
              <p>
                <strong>Email:</strong> {connection.sender.email}
              </p>
            )}
            {connection.sender?.role && (
              <p>
                <strong>Role:</strong> {connection.sender.role}
              </p>
            )}
          </div>

          <div className="modal-section">
            <h3>Receiver Details</h3>
            <p>
              <strong>Name:</strong> {connection.receiver?.fullName || "N/A"}
            </p>
            <p>
              <strong>Receiver ID:</strong>{" "}
              {connection.receiver?._id || String(connection.receiver) || "N/A"}
            </p>
            {/* Add more receiver details if available in connection.receiver object */}
            {connection.receiver?.email && (
              <p>
                <strong>Email:</strong> {connection.receiver.email}
              </p>
            )}
            {connection.receiver?.role && (
              <p>
                <strong>Role:</strong> {connection.receiver.role}
              </p>
            )}
          </div>

          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-${connection.status}`}>
              {connection.status}
            </span>
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(connection.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Updated At:</strong>{" "}
            {new Date(connection.updatedAt).toLocaleString()}
          </p>
          {/* Add any other relevant connection details here */}
          {connection.message && (
            <p>
              <strong>Message:</strong> {connection.message}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-close-button-footer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDetailsModal;
