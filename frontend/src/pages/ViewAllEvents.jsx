import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
// The react-toastify CSS import should ideally be handled at a global level (e.g., App.js or index.js)
// or via a separate CSS file that imports it, but for a self-contained Canvas component,
// it might need to be imported directly or addressed by the build system.
// For now, removing this line to address the specific "Cannot import ... into a JavaScript file" error.
// import "react-toastify/dist/ReactToastify.css";
import ConnectionsHeader from "../components/ConnectionsHeader"; // Adjusted path
import Footer from "../components/Footer"; // Adjusted path
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserCircle, FaBuilding, FaBriefcase, FaLinkedin, FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Adjusted path for react-icons/fa
import "../styles/ViewAllEvents.css"; // Adjusted path

const ViewAllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/v1/events/getallEvents");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch events.");
        }
        const data = await response.json();
        setEvents(data.events);
        // toast.success(data.message || "Events loaded!"); // Removed to prevent excessive toasts
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
    return (
      <>
        <ConnectionsHeader />
        <div className="events-container status-state loading-state">
          <div className="loading-spinner" role="status" aria-live="polite">
            <div className="spinner"></div>
            <p>Loading events...</p>
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
        <div className="events-container status-state error-state">
          <div className="error-message" role="alert">
            <h2>Error Fetching Events</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <ConnectionsHeader />
      <div className="events-container">
        <h2 className="events-page-title">All Upcoming Events</h2>
        {events.length === 0 ? (
          <div className="status-state empty-state">
            <div className="empty-icon" aria-hidden="true">
              🗓️
            </div>
            <h3>No Events Available</h3>
            <p>There are no events scheduled at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="event-image"
                    onError={(e) => { e.target.src = "https://placehold.co/300x200/e0e0e0/555555?text=No+Image"; }}
                  />
                )}
                <div className="event-card-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  <p className="event-detail"><FaCalendarAlt className="event-icon" /> Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p className="event-detail"><FaMapMarkerAlt className="event-icon" /> Location: {event.location}</p>
                  <p className="event-detail event-verified">
                    {event.isVerified ? <FaCheckCircle className="event-icon verified-icon" /> : <FaTimesCircle className="event-icon unverified-icon" />} Verified: {event.isVerified ? "Yes" : "No"}
                  </p>

                  {event.organizer && (
                    <div className="organizer-details">
                      <h4 className="organizer-title">Organizer</h4>
                      <div className="organizer-info-row">
                        {event.organizer.profilePic ? (
                            <img
                                src={event.organizer.profilePic}
                                alt="Organizer"
                                className="organizer-pic"
                                onError={(e) => { e.target.src = "https://placehold.co/40x40/add8e6/003366?text=NP"; }}
                            />
                        ) : (
                            <div className="organizer-pic-placeholder">
                                {event.organizer.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <div className="organizer-text-details">
                            <p className="organizer-name"><FaUserCircle /> {event.organizer.fullName || event.organizer.username}</p>
                            {event.organizer.designation && event.organizer.company && (
                                <p className="organizer-job"><FaBriefcase /> {event.organizer.designation} <FaBuilding /> {event.organizer.company}</p>
                            )}
                            {event.organizer.linkedin && (
                                <a href={event.organizer.linkedin} target="_blank" rel="noopener noreferrer" className="organizer-linkedin-link">
                                    <FaLinkedin /> LinkedIn
                                </a>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                  <button onClick={() => handleViewEvent(event._id)} className="btn btn-primary view-event-button">
                    View Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ViewAllEvents;
