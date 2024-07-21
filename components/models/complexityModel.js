const mongoose = require('mongoose');

const ComplexityResultSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  cyclomaticComplexity: {
    type: Number,
    required: true,
  },
  weightedCompositeComplexity: {
    type: Number,
    required: true,
  },
  complexityLevel: {
    type: String,
    required: true,
  },
  sourceCode: {  // field to store source code
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('ComplexityResult', ComplexityResultSchema);
