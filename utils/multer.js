const multer = require("multer");
const path = require("path");
const DataUri = require("datauri/parser");

const dUri = new DataUri();

// 1. For image uploads
const imageStorage = multer.memoryStorage();

const imageUploads = multer({
  storage: imageStorage,
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Error: Only image filetypes are allowed - " + filetypes
      )
    );
  },
}).array("images", 1);

// 2. For CSV file uploads
const csvStorage = multer.memoryStorage();

const csvUpload = multer({
  storage: csvStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit for CSV
  fileFilter: (req, file, cb) => {
    const filetypes = /csv/;
    const mimetype = file.mimetype === "text/csv";
    const extname = path.extname(file.originalname).toLowerCase() === ".csv";

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: Only CSV files are allowed."));
  },
}).single("file"); // name your form-data field as "file"

const dataUri = (file) =>
  dUri.format(path.extname(file.originalname).toString(), file.buffer);

const ensureMinImages = (req, res, next) => {
  if (!req.files || req.files.length < 1) {
    console.log(req.file);
    
    return res.status(400).json({
      status: "fail",
      message: "At least 1 image is required.",
    });
  }
  next();
};

module.exports = {
  dataUri,
  imageUploads,
  csvUpload,
  ensureMinImages,
};
