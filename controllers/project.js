const Project = require("../models/project");
const AppError = require("../utils/AppError");


const createProject = async (req, res, next) => {
  try {
    const { title, description, images, objectives, startDate, endDate, status } = req.body;

    if (!title || !description || !images || !objectives || !startDate || !endDate) {
      return next(new AppError("All required fields must be provided", 400));
    }

    const createdBy = req.user._id; // from auth middleware

    const project = await Project.create({
      title,
      description,
      images,
      objectives,
      startDate,
      endDate,
      status,
      createdBy,
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