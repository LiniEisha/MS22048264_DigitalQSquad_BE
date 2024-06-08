const mongoose = require('mongoose');

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
});

module.exports = mongoose.model('Module', ModuleSchema);
