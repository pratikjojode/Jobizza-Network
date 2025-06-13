import React, { useState } from "react";
import ConnectionsHeader from "../components/ConnectionsHeader"; // Adjusted path
import Footer from "../components/Footer"; // Adjusted path
import { toast } from "react-toastify";
import "../styles/CreateEvents.css"; // Adjusted path

const CreateEvents = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("location", location);

    if (image) {
      console.log("Image file:", image);
      formData.append("profilePic", image); // Assuming your backend expects 'profilePic' for event image
    } else {
      console.log("No image selected");
    }

    // For debugging: log formData contents (can be removed in production)
    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/v1/events", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type is typically 'multipart/form-data' for FormData,
          // but fetch handles this automatically when 'body' is a FormData object.
          // Do NOT manually set 'Content-Type' header for FormData.
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create event");
        throw new Error(errorData.error || "Failed to create event");
      }

      const createdEvent = await response.json();
      toast.success("Event created successfully!");
      console.log("Event created successfully:", createdEvent);

      // Reset form fields after successful submission
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setImage(null);
      // You might want to reset the file input visually too,
      // which often requires a ref or re-rendering the input.
    } catch (err) {
      console.error("Error creating event:", err);
      // Avoid showing generic "An unexpected error occurred" if specific error already toasted
      if (!err.message.includes("Failed to create event")) {
        toast.error("An unexpected error occurred: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConnectionsHeader />
      <div className="create-event-page-container">
        <div className="create-event-card">
          <h2 className="create-event-title">Create New Event</h2>
          <form onSubmit={handleSubmit} className="create-event-form">
            <div className="form-group">
              <label htmlFor="title">Event Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Event Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event"
                required
                rows="5"
                className="form-textarea"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="date">Event Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Event Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Virtual, New York, Conference Hall"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Event Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => {
                  console.log("File selected:", e.target.files[0]);
                  setImage(e.target.files[0]);
                }}
                className="form-file-input"
              />
              {/* Optional: Add a preview for the selected image */}
              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Event Preview"
                  className="image-preview"
                />
              )}
            </div>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateEvents;
