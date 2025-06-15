import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/ManageEvents.css";
const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const token = localStorage.getItem("token");

  const escapeCsvField = (field) => {
    if (
      typeof field === "string" &&
      (field.includes(",") || field.includes('"') || field.includes("\n"))
    ) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const getAllEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to load events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`/api/v1/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted successfully");
      setEvents(events.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleEditClick = (event) => {
    setCurrentEvent({ ...event });
    setSelectedImage(null);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent({ ...currentEvent, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("title", currentEvent.title);
      formData.append("description", currentEvent.description);
      formData.append("date", currentEvent.date);
      formData.append("location", currentEvent.location);

      if (selectedImage) {
        formData.append("profilePic", selectedImage);
      }

      const response = await axios.put(
        `/api/v1/events/${currentEvent._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Event updated successfully");
      setEvents(
        events.map((e) =>
          e._id === currentEvent._id
            ? { ...response.data, organizer: e.organizer }
            : e
        )
      );
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update event:", error);
      toast.error(error.response?.data?.message || "Failed to update event");
    }
  };

  const handleExportCsv = () => {
    if (events.length === 0) {
      toast.info("No events to export.");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Description",
      "Date",
      "Location",
      "Image URL",
      "Organizer Username",
      "Organizer Full Name",
      "Organizer Email",
      "Organizer Company",
      "Organizer Designation",
      "Organizer Role",
    ];

    const csvRows = events.map((event) => [
      escapeCsvField(event._id || ""),
      escapeCsvField(event.title || ""),
      escapeCsvField(event.description || ""),
      escapeCsvField(
        event.date ? new Date(event.date).toLocaleDateString() : ""
      ),
      escapeCsvField(event.location || ""),
      escapeCsvField(event.imageUrl || ""),
      escapeCsvField(event.organizer?.username || ""),
      escapeCsvField(event.organizer?.fullName || ""),
      escapeCsvField(event.organizer?.email || ""),
      escapeCsvField(event.organizer?.company || ""),
      escapeCsvField(event.organizer?.designation || ""),
      escapeCsvField(event.organizer?.role || ""),
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
      `events_data_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Events exported to CSV!");
  };

  useEffect(() => {
    getAllEvents();
  }, [token]);

  return (
    <div className="manage-events-container">
      <h2>Manage Events</h2>

      <div className="controls">
        <div className="view-controls">
          <button
            onClick={() => setViewMode("grid")}
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`view-btn ${viewMode === "table" ? "active" : ""}`}
          >
            Table View
          </button>
        </div>
        <button onClick={handleExportCsv} className="export-csv-btn">
          Export to CSV
        </button>
      </div>

      {loading ? (
        <p className="loading-message">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="no-events-message">No events found.</p>
      ) : (
        <>
          {viewMode === "grid" && (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event._id} className="event-card">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="event-card-image"
                    />
                  )}
                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-description">{event.description}</p>
                  <p className="event-card-detail">
                    <strong>Date:</strong> {event.date?.slice(0, 10)}
                  </p>
                  <p className="event-card-detail">
                    <strong>Location:</strong> {event.location || "N/A"}
                  </p>
                  <div className="organizer-info">
                    <h4>Organizer Info:</h4>
                    <p>
                      <strong>Name:</strong>{" "}
                      {event.organizer?.fullName || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {event.organizer?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Company:</strong>{" "}
                      {event.organizer?.company || "N/A"}
                    </p>
                    <p>
                      <strong>Designation:</strong>{" "}
                      {event.organizer?.designation || "N/A"}
                    </p>
                    <p>
                      <strong>Role:</strong> {event.organizer?.role || "N/A"}
                    </p>
                  </div>
                  <div className="event-card-actions">
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEditClick(event)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
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
                    <th>Image</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Organizer</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Designation</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            width="50"
                            height="50"
                            style={{ objectFit: "cover" }}
                          />
                        )}
                      </td>
                      <td>{event.title}</td>
                      <td>
                        {event.description.length > 100
                          ? event.description.substring(0, 100) + "..."
                          : event.description}
                      </td>
                      <td>{event.date?.slice(0, 10)}</td>
                      <td>{event.location || "N/A"}</td>
                      <td>{event.organizer?.fullName || "N/A"}</td>
                      <td>{event.organizer?.email || "N/A"}</td>
                      <td>{event.organizer?.company || "N/A"}</td>
                      <td>{event.organizer?.designation || "N/A"}</td>
                      <td>{event.organizer?.role || "N/A"}</td>
                      <td>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="delete-btn-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleEditClick(event)}
                          className="edit-btn-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editModalOpen && currentEvent && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <h3>Edit Event</h3>
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={currentEvent.title || ""}
              onChange={handleEditChange}
            />
            <label>Description:</label>
            <textarea
              name="description"
              value={currentEvent.description || ""}
              onChange={handleEditChange}
            />
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={currentEvent.date?.slice(0, 10) || ""}
              onChange={handleEditChange}
            />
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={currentEvent.location || ""}
              onChange={handleEditChange}
            />
            <label>Image:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {currentEvent.imageUrl && !selectedImage && (
              <img
                src={currentEvent.imageUrl}
                alt="Current Event"
                width="100"
                style={{ marginTop: "10px", display: "block" }}
              />
            )}
            {selectedImage && (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="New Event Preview"
                width="100"
                style={{ marginTop: "10px", display: "block" }}
              />
            )}
            <div className="modal-actions">
              <button
                onClick={() => setEditModalOpen(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="update-btn">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
