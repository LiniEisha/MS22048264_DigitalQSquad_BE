// models/moduleModel.js
const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  name: String,
  sourceCodePath: String,
  complexityLevel: String,
  cyclomaticComplexity: Number,
  weightedCompositeComplexity: Number,
  sourceCode: String,
});

const Module = mongoose.model("CodeComplexity", moduleSchema);
module.exports = CodeComplexity;
