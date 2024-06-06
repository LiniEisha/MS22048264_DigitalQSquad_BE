// routes/moduleRoutes.js
const express = require("express");
const { createCoverageModule } = require("../controller/moduleController");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/modules",
  upload.fields([
    { name: "sourceCode" },
    { name: "automationSuite" },
    { name: "unitTestSuite" },
  ]),
  createCoverageModule
);

// Other routes...
module.exports = router;
