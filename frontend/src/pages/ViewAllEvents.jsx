import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConnectionsHeader from "../components/ConnectionsHeader";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserCircle,
  FaBuilding,
  FaBriefcase,
  FaLinkedin,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "../styles/ViewAllEvents.css";

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
    navigate(`/events/${eventId}`);
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
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
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
            <p>
              There are no events scheduled at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                {/* Event Image - Will be visible on larger cards, hidden or styled differently for smaller ones if needed */}
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="event-image"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/100x100/e0e0e0/555555?text=Event"; // Smaller placeholder
                    }}
                  />
                )}

                <div className="event-card-content">
                  {/* Event Title */}
                  <h3 className="event-title">{event.title}</h3>

                  {/* Event Details (Date, Location, Verified Status) */}
                  <p className="event-detail">
                    <FaCalendarAlt className="event-icon" />{" "}
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="event-detail">
                    <FaMapMarkerAlt className="event-icon" /> {event.location}
                  </p>
                  <p className="event-detail event-verified">
                    {event.isVerified ? (
                      <FaCheckCircle className="event-icon verified-icon" />
                    ) : (
                      <FaTimesCircle className="event-icon unverified-icon" />
                    )}{" "}
                    {event.isVerified ? "Verified" : "Unverified"}
                  </p>

                  {/* Organizer Details - Similar to Connection Card's profile info */}
                  {event.organizer && (
                    <div className="organizer-section">
                      <div className="organizer-profile">
                        {event.organizer.profilePic ? (
                          <img
                            src={event.organizer.profilePic}
                            alt="Organizer"
                            className="organizer-avatar"
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/40x40/add8e6/003366?text=NP";
                            }}
                          />
                        ) : (
                          <div className="organizer-avatar-placeholder">
                            {event.organizer.fullName?.charAt(0)?.toUpperCase() || event.organizer.username?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <p className="organizer-name">
                          {event.organizer.fullName || event.organizer.username}
                        </p>
                      </div>
                      {event.organizer.designation &&
                        event.organizer.company && (
                          <p className="organizer-job">
                            {event.organizer.designation} at{" "}
                            {event.organizer.company}
                          </p>
                        )}
                    </div>
                  )}

                  {/* View Event Button */}
                  <button
                    onClick={() => handleViewEvent(event._id)}
                    className="btn btn-primary view-event-button"
                  >
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
