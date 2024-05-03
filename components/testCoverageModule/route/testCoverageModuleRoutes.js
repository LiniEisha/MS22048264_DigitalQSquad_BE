// routes/moduleRoutes.js
const express = require("express");
const {
  createModule,
  listModules,
  getCoverageReport,
  getDetailedCoverageReport,
} = require("../controller/testCoverageModuleController");
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
  createModule
);

router.get("/modules", listModules);
router.get("/modules/:id/report", getCoverageReport);
router.get("/modules/:id/report/detail", getDetailedCoverageReport);

module.exports = router;
