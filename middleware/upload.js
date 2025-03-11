// const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });
// module.exports = upload;

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Define allowed formats
const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/gif",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "movie_covers",
    format: async (req, file) => "jpg",
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log("Received file:", file);

  if (!file) {
    console.log("No file received!");
    return cb(new Error("No file received!"), false);
  }

  console.log("File mimetype:", file.mimetype);

  if (allowedFormats.includes(file.mimetype)) {
    console.log("File is valid");
    cb(null, true);
  } else {
    console.log("Invalid file type:", file.mimetype);
    cb(new Error("Only image uploads are allowed!"), false);
  }
};


const upload = multer({ storage, fileFilter });

module.exports = upload;
