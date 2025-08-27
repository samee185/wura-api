const Event = require("../models/event");
const AppError = require("../utils/AppError");


 
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      eventDate,
      eventTime,
      venue,
      images,
      aboutEvent,
      objectives,
      speakers,
      host,
    } = req.body;

    if (
      !title ||
      !description ||
      !eventDate ||
      !eventTime ||
      !venue ||
      !images ||
      !aboutEvent ||
      !objectives ||
      !speakers ||
      !host
    ) {
      return next(new AppError("All fields are required", 400));
    }

    const createdBy = req.user._id; 

    const event = await Event.create({
      title,
      description,
      eventDate,
      eventTime,
      venue,
      images,
      aboutEvent,
      objectives,
      speakers,
      host,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    next(error);
  }
};



const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "firstName lastName email")
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};



const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName email"
    );

    if (!event) {
      return next(new AppError("Event not found", 404));
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};




const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError("Event not found", 404));
    }

    // ensure only creator or admin can update
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to update this event", 403));
    }

    const updates = { ...req.body };
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};


const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError("Event not found", 404));
    }

    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to delete this event", 403));
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
    createEvent,  
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
}