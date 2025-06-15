import React, { useState, useRef } from "react";
import ConnectionsHeader from "../components/ConnectionsHeader"; // Adjusted path
import Footer from "../components/Footer"; // Adjusted path
import { toast } from "react-toastify";
import { FaLightbulb, FaCheckCircle, FaUpload } from "react-icons/fa"; // Added FaUpload for image input styling
import "../styles/CreateEvents.css"; // Adjusted path

const CreateEvents = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Ref for file input to clear it

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
      // Reset file input visually
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
        <h2 className="page-title">Create New Event</h2>
        <p className="page-subtitle">Host engaging experiences for the Jobizza Network community</p>

        <div className="create-event-grid-container">
          {/* Left Column: Create Event Form */}
          <div className="create-event-card">
            <form onSubmit={handleSubmit} className="create-event-form">
              <div className="form-group">
                <label htmlFor="title">Event Title <span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an engaging title for your event..."
                  required
                  className="form-input"
                  minLength="5"
                  maxLength="100"
                />
                <div className="char-count">
                  {title.length}/100 characters (minimum 5)
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Event Description <span className="required">*</span></label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of your event, its agenda, and what attendees can expect."
                  required
                  rows="5"
                  className="form-textarea"
                  minLength="20"
                  maxLength="1000"
                ></textarea>
                <div className="char-count">
                  {description.length}/1000 characters (minimum 20)
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="date">Event Date <span className="required">*</span></label>
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
                <label htmlFor="location">Event Location <span className="required">*</span></label>
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
                <label htmlFor="image">Event Banner Image</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImage(e.target.files[0]);
                      } else {
                        setImage(null);
                      }
                    }}
                    className="hidden-file-input" // This input is hidden
                  />
                  <label htmlFor="image" className="custom-file-upload">
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Event Banner Preview"
                        className="uploaded-image-preview"
                      />
                    ) : (
                      <>
                        <FaUpload className="upload-icon" />
                        <p>Click to upload or drag and drop</p>
                        <p className="file-type-info">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </form>
          </div>

          {/* Right Column: Tips for a Great Event Post */}
          <div className="tips-section">
            <h3 className="tips-title">
              <FaLightbulb className="tips-lightbulb-icon" /> Tips for a Great Event Post
            </h3>
            <ul>
              <li className="tip-item">
                <FaCheckCircle className="tip-icon" /> Use a clear, engaging title that highlights the event's value.
              </li>
              <li className="tip-item">
                <FaCheckCircle className="tip-icon" /> Write a compelling description with key takeaways and benefits for attendees.
              </li>
              <li className="tip-item">
                <FaCheckCircle className="tip-icon" /> Specify date, time, and location clearly. For virtual events, mention the platform.
              </li>
              <li className="tip-item">
                <FaCheckCircle className="tip-icon" /> Include a high-quality, relevant banner image to attract attention.
              </li>
              <li className="tip-item">
                <FaCheckCircle className="tip-icon" /> Highlight the organizer's credentials and what makes them qualified.
              </li>
              <li className="tip-item">
                <FaCheckCircle className="tip-icon" /> Add a clear call to action for registration or more information.
              </li>
              <li className="tip-item">
                <FaCheckCircle className="tip-icon" /> Promote any special guests, speakers, or unique activities.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateEvents;
