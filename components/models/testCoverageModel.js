// models/testCoverageModel.js
const mongoose = require('mongoose');

const TestCoverageSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  unitTestCoverage: {
    type: Number,
    default: 0,
  },
  automationTestCoverage: {
    type: Number,
    default: 0,
  },
  totalCoverage: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('TestCoverage', TestCoverageSchema);
