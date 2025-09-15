const Event = require("../models/event");
const AppError = require("../utils/AppError");
const { dataUri } = require("../utils/multer");
const { uploader } = require("../utils/cloudinary");


 
const createEvent = async (req, res, next) => {
  try {
    // Joi validation
    console.log(req.body);
    
    const { eventValidationSchema } = require("../validation/event");
    const { error, value } = eventValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError(error.details.map(d => d.message).join(", "), 400));
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const file64 = dataUri(file).content;
        const result = await uploader.upload(file64, { folder: "events" });
        imageUrls.push(result.secure_url);
      }
    }
    const { title, description, date, time, venue, aboutEvent } = req.body;

    if (imageUrls.length === 0) {
      return next(new AppError("At least one image is required", 400));
    }

    const createdBy = req.user._id;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      images: imageUrls,
      aboutEvent,
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