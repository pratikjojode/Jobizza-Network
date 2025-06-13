// Assuming you have a userModel.js for 'User' reference

import Event from "../models/eventModel.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.path;
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      imageUrl: imageUrl,
      organizer: req.user._id,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("organizer", "username");
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "username"
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, date, location, isVerified } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user._id) {
      return res.status(403).json({
        message: "Forbidden: You are not the organizer of this event",
      });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;

    if (req.file) {
      event.imageUrl = req.file.path;
    } else if (req.body.imageUrl === "") {
      event.imageUrl = null;
    }

    if (typeof isVerified === "boolean") {
      event.isVerified = isVerified;
    }

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You are not the organizer of this event",
      });
    }
    await Event.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
