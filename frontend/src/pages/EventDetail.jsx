import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConnectionsHeader from "../components/ConnectionsHeader";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/api/v1/events/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch event details."
          );
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
      <div>
        <ConnectionsHeader />
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ConnectionsHeader />
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <ConnectionsHeader />
        <p>Event not found.</p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <ConnectionsHeader />
      <h2>Event Details: {event.title}</h2>

      {event.imageUrl && <img src={event.imageUrl} alt={event.title} />}
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>Date: {new Date(event.date).toLocaleDateString()}</p>
      <p>Location: {event.location}</p>
      <p>Verified: {event.isVerified ? "Yes" : "No"}</p>

      {event.organizer && (
        <div>
          {event.organizer.profilePic && (
            <img src={event.organizer.profilePic} alt="Organizer" />
          )}
          <p>Name: {event.organizer.fullName || event.organizer.username}</p>
          <p>Designation: {event.organizer.designation}</p>
          <p>Company: {event.organizer.company}</p>
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
    </div>
  );
};

export default EventDetail;
