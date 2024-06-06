const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  calculateCyclomaticComplexity,
  calculateWeightedCompositeComplexity,
} = require("../logic/complexityAnalysis");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });
// const upload = multer({ storage });

router.post("/upload", upload.array("sourceCode"), async (req, res) => {
  try {
    const files = req.files;
    let complexities = [];

    for (const file of files) {
      const codeContent = fs.readFileSync(file.path, "utf8");
      const cyclomatic = calculateCyclomaticComplexity(codeContent);
      const weighted = calculateWeightedCompositeComplexity(codeContent);
      complexities.push({ file: file.originalname, cyclomatic, weighted });
      fs.unlinkSync(file.path); // Clean up file from server after analysis
    }

    res.json({ message: "Complexity analysis completed", complexities });
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).send("Error processing files");
  }
});

module.exports = router;
