// routes/codeComplexityRoutes.js
const express = require("express");
const {
  createComplexityModule,
  getComplexityReport,
} = require("../controller/codeComplexityModuleController");
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
  "/code-complexity/modules",
  upload.single("sourceCode"),
  createComplexityModule
);
router.get("/code-complexity/modules/:id/report", getComplexityReport);
router.get(
  "/code-complexity/modules/:id/report/detail",
  getDetailedComplexityReport
);

module.exports = router;
