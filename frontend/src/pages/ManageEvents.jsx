import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import EditEventModal from "./EditEventModal"; // Assuming EditEventModal is in the same directory for this example

const ManageEvents = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'table'
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
      const response = await axios.get("/api/v1/events");
      let fetchedData = response.data;

      // Adapt to various backend response structures
      if (fetchedData && fetchedData.data && Array.isArray(fetchedData.data)) {
        fetchedData = fetchedData.data;
      } else if (
        fetchedData &&
        fetchedData.events &&
        Array.isArray(fetchedData.events)
      ) {
        fetchedData = fetchedData.events;
      } else if (!Array.isArray(fetchedData)) {
        fetchedData = [];
        console.warn(
          "Backend /api/v1/events did not return an array as expected. Received:",
          response.data
        );
      }
      setEvents(fetchedData); // Set all fetched events for admin view
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load all events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login"); // Redirect if not authenticated (should eventually include admin role check)
      return;
    }

    fetchAllEvents();
  }, [isAuthenticated, authLoading, navigate]); // Removed 'user' from dependency as we fetch all events now

  const handleDelete = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await axios.delete(`/api/v1/events/${eventId}`);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
      alert("Event deleted successfully!");
    } catch (err) {
      console.error(
        "Failed to delete event:",
        err.response?.data?.message || err.message
      );
      setError("Failed to delete event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    // This function is called by the modal when an update is successful.
    // We close the modal and re-fetch all events to ensure the list is up-to-date.
    setIsEditModalOpen(false);
    setEditingEvent(null);
    await fetchAllEvents(); // Re-fetch all events after an update
    alert("Event updated successfully!");
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
      "Organizer Name", // If organizer is populated with name
      "Created At",
      "Updated At",
    ];

    const csvRows = events.map((event) => [
      escapeCsvField(event._id || ""),
      escapeCsvField(event.title || ""),
      escapeCsvField(event.description || ""),
      escapeCsvField(new Date(event.date).toLocaleString() || ""),
      escapeCsvField(event.location || ""),
      escapeCsvField(event.imageUrl || ""),
      escapeCsvField(event.isVerified ? "Yes" : "No"),
      escapeCsvField(
        event.organizer ? event.organizer._id || event.organizer : ""
      ), // Handle populated or plain ID
      escapeCsvField(
        event.organizer && typeof event.organizer === "object"
          ? event.organizer.username || event.organizer.email || ""
          : ""
      ), // Assuming username/email if populated
      escapeCsvField(new Date(event.createdAt).toLocaleString() || ""),
      escapeCsvField(new Date(event.updatedAt).toLocaleString() || ""),
    ]);

    const csvContent = [
      headers.map(escapeCsvField).join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "all_events.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to manage events.</div>;
  }

  return (
    <div>
      <h1>Admin: Manage All Events</h1>

      <div>
        <div>
          <button onClick={() => setViewMode("grid")}>Grid View</button>
          <button onClick={() => setViewMode("table")}>Table View</button>
        </div>
        <button onClick={handleExportCsv}>Export to CSV</button>
      </div>

      {events.length === 0 ? (
        <p>No events found in the system.</p>
      ) : (
        <>
          {viewMode === "grid" && (
            <div>
              {events.map((event) => (
                <div key={event._id}>
                  <h2>{event.title}</h2>
                  <p>{event.description}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  {event.imageUrl && (
                    <img
                      src={`http://localhost:3000/${event.imageUrl.replace(
                        /\\/g,
                        "/"
                      )}`}
                      alt={event.title}
                    />
                  )}
                  <div>
                    <button onClick={() => handleEdit(event)}>Edit</button>
                    <button onClick={() => handleDelete(event._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "table" && (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Organizer ID</th>
                    <th>Is Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>{event.title}</td>
                      <td>{new Date(event.date).toLocaleDateString()}</td>
                      <td>{event.location}</td>
                      <td>
                        {event.organizer
                          ? event.organizer._id || event.organizer
                          : "N/A"}
                      </td>
                      <td>{event.isVerified ? "Yes" : "No"}</td>
                      <td>
                        <div>
                          <button onClick={() => handleEdit(event)}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(event._id)}>
                            Delete
                          </button>
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
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ManageEvents;
