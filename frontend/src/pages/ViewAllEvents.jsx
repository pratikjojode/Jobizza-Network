import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify"; // Ensure ToastContainer is imported
import "react-toastify/dist/ReactToastify.css"; // Ensure CSS is imported
import ConnectionsHeader from "../components/ConnectionsHeader";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ViewAllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/v1/events/getallEvents");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch events.");
        }
        const data = await response.json();
        setEvents(data.events);
        toast.success(data.message || "Events loaded!");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`); // Redirects to /events/:id
  };

  if (loading) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <ToastContainer /> {/* ToastContainer should be placed here */}
      <ConnectionsHeader />
      <h2>All Events</h2>
      {events.length === 0 ? (
        <p>No events available at the moment.</p>
      ) : (
        <div className="events-grid">
          {" "}
          {/* Consider adding a class for styling */}
          {events.map((event) => (
            <div key={event._id} className="event-card">
              {" "}
              {/* Consider adding a class for styling */}
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="event-image"
                />
              )}
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Location: {event.location}</p>
              <p>Verified: {event.isVerified ? "Yes" : "No"}</p>
              {event.organizer && (
                <div className="organizer-details">
                  {" "}
                  {/* Consider adding a class for styling */}
                  {event.organizer.profilePic && (
                    <img
                      src={event.organizer.profilePic}
                      alt="Organizer"
                      className="organizer-pic"
                    />
                  )}
                  <p>{event.organizer.fullName}</p>
                  <p>
                    {event.organizer.designation} @ {event.organizer.company}
                  </p>
                  <p>Role: {event.organizer.role}</p>
                  {event.organizer.linkedin && (
                    <p>
                      LinkedIn:{" "}
                      <a
                        href={event.organizer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {event.organizer.linkedin}
                      </a>
                    </p>
                  )}
                </div>
              )}
              <button onClick={() => handleViewEvent(event._id)}>
                View Event
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ViewAllEvents;
