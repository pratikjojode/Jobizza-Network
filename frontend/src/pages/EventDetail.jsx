import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ConnectionsHeader from "../components/ConnectionsHeader";
import Footer from "../components/Footer";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserCircle,
  FaBriefcase,
  FaBuilding,
  FaLinkedin,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "../styles/EventDetail.css";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      setEvent(null);
      try {
        const response = await fetch(`/api/v1/events/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch event details.");
        }
        const data = await response.json();
        setEvent(data);
        toast.success("Event details loaded!");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <ConnectionsHeader />
        <div className="event-detail-container loading-state">
          <div className="loading-spinner" role="status" aria-live="polite">
            <div className="spinner"></div>
            <p>Loading event details...</p>
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
        <div className="event-detail-container error-state">
          <div className="error-message" role="alert">
            <h2>Error Loading Event</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-back">
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <ConnectionsHeader />
        <div className="event-detail-container not-found-state">
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              🚫
            </div>
            <h3>Event Not Found</h3>
            <p>The event you are looking for does not exist or is unavailable.</p>
            <button onClick={() => navigate("/events")} className="btn btn-primary">
              View All Events
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ConnectionsHeader />
      <div className="event-detail-container">
        <div className="event-detail-card">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="event-detail-image"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/700x400/e0e0e0/555555?text=No+Image";
              }}
            />
          )}

          <div className="event-info-section">
            <h1 className="event-detail-title">{event.title}</h1>
            <p className="event-detail-item">
              <FaCalendarAlt className="detail-icon" /> Date: <span>{new Date(event.date).toLocaleDateString()}</span>
            </p>
            <p className="event-detail-item">
              <FaMapMarkerAlt className="detail-icon" /> Location: <span>{event.location}</span>
            </p>
            <p className="event-detail-item event-verified">
              {event.isVerified ? (
                <FaCheckCircle className="detail-icon verified-icon" />
              ) : (
                <FaTimesCircle className="detail-icon unverified-icon" />
              )} Verified: <span>{event.isVerified ? "Yes" : "No"}</span>
            </p>
          </div>

          <div className="event-description-section">
            <h2 className="section-title">
              <FaInfoCircle className="section-icon" /> About This Event
            </h2>
            <p className="event-description-text">{event.description}</p>
          </div>

          {event.organizer && (
            <div className="organizer-section">
              <h2 className="section-title">
                <FaUserCircle className="section-icon" /> Organized By
              </h2>
              <div className="organizer-content">
                {event.organizer.profilePic ? (
                  <img
                    src={event.organizer.profilePic}
                    alt="Organizer"
                    className="organizer-profile-pic"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/70x70/add8e6/003366?text=NP";
                    }}
                  />
                ) : (
                  <div className="organizer-profile-pic-placeholder">
                    {event.organizer.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="organizer-details-text">
                  <p className="organizer-name">
                    {event.organizer.fullName || event.organizer.username}
                  </p>
                  {event.organizer.designation && event.organizer.company && (
                    <p className="organizer-job-title">
                      <FaBriefcase className="organizer-icon" /> {event.organizer.designation} at <FaBuilding className="organizer-icon" /> {event.organizer.company}
                    </p>
                  )}
                  {event.organizer.role && (
                    <p className="organizer-role">Role: {event.organizer.role}</p>
                  )}
                  {event.organizer.linkedin && (
                    <p className="organizer-linkedin-wrapper">
                      <a
                        href={event.organizer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="organizer-linkedin-link"
                      >
                        <FaLinkedin className="organizer-icon" /> View LinkedIn Profile
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="event-actions-footer">
            <button onClick={() => navigate("/events")} className="btn btn-secondary">
              Back to All Events
            </button>
            <button
              onClick={() => toast.info("Registration functionality coming soon!")}
              className="btn btn-primary"
            >
              Register for Event
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventDetail;
