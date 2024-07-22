const mongoose = require('mongoose');

const TestCoverageSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  unitTestLineCoverage: { type: Number, required: true },
  unitTestBranchCoverage: { type: Number, required: true },
  automationLineCoverage: { type: Number, required: true },
  automationBranchCoverage: { type: Number, required: true },
  totalLineCoverage: { type: Number, required: true },
  totalBranchCoverage: { type: Number, required: true },
  sourceCode: { type: String, required: true },
  annotatedSourceCode: {type: String},
});

module.exports = mongoose.model('TestCoverage', TestCoverageSchema);
