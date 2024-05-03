// models/moduleModel.js
const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  name: String,
  sourceCodePath: String,
  automationSuitePath: String,
  unitTestSuitePath: String,
  totalCoverage: Number,
  totalLines: Number,
  uncoveredLines: Number,
  branchesToCover: Number,
  totalUncoveredBranches: Number,
  branchCoverage: Number,
  uncoveredBranchDetails: [String],
  uncoveredLineDetails: [String],
  sourceCode: String,
});

const Module = mongoose.model("testCoverage", moduleSchema);
module.exports = testCoverage;
