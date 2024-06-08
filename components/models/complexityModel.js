const mongoose = require('mongoose');

const ComplexityResultSchema = new mongoose.Schema({
  moduleName: { type: String, required: true },
  cyclomaticComplexity: { type: Number, required: true },
  weightedCompositeComplexity: { type: Number, required: true },
  complexity: { type: String, required: true }
});

module.exports = mongoose.model('ComplexityResult', ComplexityResultSchema);
