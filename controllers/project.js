const { date } = require("joi");
const Project = require("../models/project");
const AppError = require("../utils/AppError");
const { dataUri } = require("../utils/multer");
const { uploader } = require("../utils/cloudinary");
const { projectValidationSchema } = require("../validation/project");
const { Readable } = require("stream");


// const bufferToStream = (buffer) => {
//   const stream = new Readable();
//   stream.push(buffer);
//   stream.push(null);
//   return stream;
// };


const createProject = async (req, res, next) => {
  try {
    // ✅ Validate request body
    const { error, value } = projectValidationSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return next(new AppError(error.details.map(d => d.message).join(", "), 400));
    }

    // ✅ Upload images to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const file64 = dataUri(file).content;
        const result = await uploader.upload(file64, {
          folder: "projects",
        });
        imageUrls.push(result.secure_url);
      }
    }

    // ✅ Create project
    const project = await Project.create({
      ...value,                // use validated data from Joi
      images: imageUrls,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const { status } = req.query; 
    let query = {};

    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate("createdBy", "firstName lastName email")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};


const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName email"
    );

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};


const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    // ensure only creator or admin can update
    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to update this project", 403));
    }

    const updates = { ...req.body };
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};




const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    if (
      project.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(new AppError("Not authorized to delete this project", 403));
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
    createProject,  
    getAllProjects,
    getProjectById, 
    updateProject,
    deleteProject,
}