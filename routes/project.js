const express = require("express");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/project");
const { protect } = require("../middlewares/auth");
const { ensureMinImages, imageUploads } = require('../utils/multer');

const router = express.Router()


router.route("/")
  .get(getAllProjects)
  .post(protect, imageUploads, createProject);

router.route("/:id")
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
