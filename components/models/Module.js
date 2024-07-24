// Module.js
// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  sourceCode: {
    type: String,
    required: true,
  },
  unitTestSuite: {
    type: String,
  },
  automationSuite: {
    type: String,
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

export default mongoose.model('Module', ModuleSchema);
// module.exports = mongoose.model('Module', ModuleSchema);
