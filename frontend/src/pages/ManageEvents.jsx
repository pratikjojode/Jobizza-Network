import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import EditEventModal from "./EditEventModal";

const ManageEvents = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  // Helper function to escape CSV fields
  const escapeCsvField = (field) => {
    if (
      typeof field === "string" &&
      (field.includes(",") || field.includes('"') || field.includes("\n"))
    ) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const fetchAllEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Set up axios with auth token
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get("/api/v1/events", config);

      // Your backend returns events directly as an array
      let fetchedData = response.data;

      if (!Array.isArray(fetchedData)) {
        console.warn(
          "Backend /api/v1/events did not return an array as expected. Received:",
          response.data
        );
        fetchedData = [];
      }

      setEvents(fetchedData);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        navigate("/login");
      } else {
        setError("Failed to load events. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchAllEvents();
  }, [isAuthenticated, authLoading, navigate]);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (updatedEventData) => {
    try {
      const token = localStorage.getItem("token");

      // Create FormData for file upload support
      const formData = new FormData();

      // Add text fields
      if (updatedEventData.title)
        formData.append("title", updatedEventData.title);
      if (updatedEventData.description)
        formData.append("description", updatedEventData.description);
      if (updatedEventData.date) formData.append("date", updatedEventData.date);
      if (updatedEventData.location)
        formData.append("location", updatedEventData.location);
      if (typeof updatedEventData.isVerified === "boolean") {
        formData.append("isVerified", updatedEventData.isVerified);
      }

      // Handle image upload (your backend expects 'profilePic' field name)
      if (updatedEventData.image instanceof File) {
        formData.append("profilePic", updatedEventData.image);
      } else if (updatedEventData.removeImage) {
        formData.append("imageUrl", ""); // Send empty string to remove image
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.put(
        `/api/v1/events/${editingEvent._id}`,
        formData,
        config
      );

      setIsEditModalOpen(false);
      setEditingEvent(null);
      await fetchAllEvents();
      alert("Event updated successfully!");

      return response.data;
    } catch (err) {
      console.error("Failed to update event:", err);

      let errorMessage = "Failed to update event. Please try again.";

      if (err.response?.status === 403) {
        errorMessage =
          "You are not authorized to edit this event. Only the organizer can edit their events.";
      } else if (err.response?.status === 404) {
        errorMessage = "Event not found.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
      alert(errorMessage);
      throw err;
    }
  };

  const handleExportCsv = () => {
    if (events.length === 0) {
      alert("No events to export.");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Description",
      "Date",
      "Location",
      "Image URL",
      "Is Verified",
      "Organizer ID",
      "Organizer Name",
      "Created At",
      "Updated At",
    ];

    const csvRows = events.map((event) => [
      escapeCsvField(event._id || ""),
      escapeCsvField(event.title || ""),
      escapeCsvField(event.description || ""),
      escapeCsvField(event.date ? new Date(event.date).toLocaleString() : ""),
      escapeCsvField(event.location || ""),
      escapeCsvField(event.imageUrl || ""),
      escapeCsvField(event.isVerified ? "Yes" : "No"),
      escapeCsvField(
        event.organizer
          ? typeof event.organizer === "object"
            ? event.organizer._id
            : event.organizer
          : ""
      ),
      escapeCsvField(
        event.organizer && typeof event.organizer === "object"
          ? event.organizer.username || event.organizer.email || ""
          : ""
      ),
      escapeCsvField(
        event.createdAt ? new Date(event.createdAt).toLocaleString() : ""
      ),
      escapeCsvField(
        event.updatedAt ? new Date(event.updatedAt).toLocaleString() : ""
      ),
    ]);

    const csvContent = [
      headers.map(escapeCsvField).join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `all_events_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || loading) {
    return (
      <div className="loading-container">
        <div>Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Please log in to manage events.</div>;
  }

  return (
    <>
      <div className="manage-events-container">
        <h1>Admin: Manage All Events</h1>

        <div className="controls">
          <div className="view-controls">
            <button
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "active" : ""}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "active" : ""}
            >
              Table View
            </button>
          </div>
          <button onClick={handleExportCsv} className="export-btn">
            Export to CSV
          </button>
        </div>

        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found in the system.</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" && (
              <div className="events-grid">
                {events.map((event) => (
                  <div key={event._id} className="event-card">
                    <h2>{event.title}</h2>
                    <p className="description">{event.description}</p>
                    <div className="event-details">
                      <p>
                        <strong>Date:</strong>{" "}
                        {event.date
                          ? new Date(event.date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "No date specified"}
                      </p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {event.location || "No location specified"}
                      </p>
                      <p>
                        <strong>Organizer:</strong>{" "}
                        {event.organizer && typeof event.organizer === "object"
                          ? event.organizer.username || "Unknown"
                          : "Unknown"}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`status ${
                            event.isVerified ? "verified" : "unverified"
                          }`}
                        >
                          {event.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </p>
                    </div>

                    {event.imageUrl && (
                      <div className="event-image">
                        <img
                          src={`http://localhost:3000/${event.imageUrl.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={event.title}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="event-actions">
                      <button
                        onClick={() => handleEdit(event)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "table" && (
              <div className="events-table-container">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Organizer</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id}>
                        <td className="title-cell">{event.title}</td>
                        <td>
                          {event.date
                            ? new Date(event.date).toLocaleDateString()
                            : "No date"}
                        </td>
                        <td>{event.location || "No location"}</td>
                        <td>
                          {event.organizer &&
                          typeof event.organizer === "object"
                            ? event.organizer.username || "Unknown"
                            : "Unknown"}
                        </td>
                        <td>
                          <span
                            className={`status ${
                              event.isVerified ? "verified" : "unverified"
                            }`}
                          >
                            {event.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() => handleEdit(event)}
                              className="edit-btn small"
                            >
                              Edit
                            </button>
                            <button className="delete-btn small">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {isEditModalOpen && editingEvent && (
          <EditEventModal
            event={editingEvent}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingEvent(null);
            }}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </>
  );
};

export default ManageEvents;
