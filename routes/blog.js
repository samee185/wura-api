const express = require("express");
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blog");
const { protect } = require("../middlewares/auth"); 
const { ensureMinImages, imageUploads } = require("../utils/multer")
const router = express.Router();

router.route("/")
  .get(getAllBlogs)
  .post(protect, ensureMinImages, imageUploads, createBlog);

router.route("/:id")
  .get(getBlogById)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog);

module.exports = router;
