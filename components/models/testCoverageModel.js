// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const TestCoverageSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  unitTestLineCoverage: { type: Number, required: true, default: 0 },
  unitTestBranchCoverage: { type: Number, required: true, default: 0 },
  automationLineCoverage: { type: Number, required: true, default: 0 },
  automationBranchCoverage: { type: Number, required: true, default: 0 },
  totalLineCoverage: { type: Number, required: true, default: 0 },
  totalBranchCoverage: { type: Number, required: true, default: 0 },
  sourceCode: { type: String, required: true },
  annotatedSourceCode: { type: String },
  totalLines: { type: Number, required: true, default: 0 },
  executedLines: { type: Number, required: true, default: 0 },
  totalBranches: { type: Number, required: true, default: 0 },
  executedBranches: { type: Number, required: true, default: 0 },
});

// module.exports = mongoose.model('TestCoverage', TestCoverageSchema);

export default mongoose.model('TestCoverage', TestCoverageSchema);
