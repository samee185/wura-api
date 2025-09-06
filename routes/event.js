const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/event");
const { protect } = require("../middlewares/auth");
const { ensureMinImages, imageUploads } = require('../utils/multer');

const router = express.Router();

router.route("/")
  .get(getAllEvents)
  .post(protect,  imageUploads, createEvent);

router.route("/:id")
  .get(getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

module.exports = router;
