const Blog = require("../models/blog");
const AppError = require("../utils/AppError"); 
const { dataUri } = require("../utils/multer");
const { uploader } = require("../utils/cloudinary");


const createBlog = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const createdBy = req.user._id;

    if (!title || !content) {
      return next(new AppError("All fields are required", 400));
    }

    // Upload image to Cloudinary
    let imageUrl = null;
    if (req.files && req.files.length > 0) {
      const file64 = dataUri(req.files[0]).content;
      const result = await uploader.upload(file64, { folder: "blogs" });
      imageUrl = result.secure_url;
    }

    if (!imageUrl) {
      return next(new AppError("Image is required", 400));
    }

    const blog = await Blog.create({ title, content, image: imageUrl, createdBy });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};


const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate("createdBy", "firstName lastName email") // show user info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};


const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy", "firstName lastName email");

    if (!blog) {
      return next(new AppError("Blog not found", 404));
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};


const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return next(new AppError("Blog not found", 404));
    }

    // ensure only creator or admin can update
    if (blog.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new AppError("Not authorized to update this blog", 403));
    }

    const updates = { ...req.body };
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};




const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return next(new AppError("Blog not found", 404));
    }

    if (blog.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new AppError("Not authorized to delete this blog", 403));
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,    
    updateBlog,
    deleteBlog,
}