// models/recommendationModel.js
const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
  className: String,
  lineNumbers: [Number],
});

const recommendationSchema = new mongoose.Schema({
  moduleId: mongoose.Schema.Types.ObjectId,
  testCoverage: {
    linesOfCode: Number,
    executedLines: Number,
    coverage: Number,
  },
  codeComplexity: {
    linesOfCode: Number,
    complexModules: [String],
  },
  areasNeedingMoreCoverage: [areaSchema],
  areasNeedingMoreTesting: [areaSchema],
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
module.exports = Recommendation;
