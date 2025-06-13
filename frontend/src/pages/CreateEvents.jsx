import React, { useState } from "react";
import ConnectionsHeader from "../components/ConnectionsHeader";
import { toast } from "react-toastify";

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
      formData.append("profilePic", image);
    } else {
      console.log("No image selected");
    }

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/v1/events", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
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

      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setImage(null);
    } catch (err) {
      console.error("Error creating event:", err);

      if (!err.message.includes("Failed to create event")) {
        toast.error("An unexpected error occurred: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ConnectionsHeader />
      <h2>Create New Event</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="4"
          ></textarea>
        </div>
        <div>
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="image">Event Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => {
              console.log("File selected:", e.target.files[0]);
              setImage(e.target.files[0]);
            }}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Creating Event..." : "Create Event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvents;
