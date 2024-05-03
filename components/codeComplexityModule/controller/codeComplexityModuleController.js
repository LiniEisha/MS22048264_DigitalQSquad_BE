// controllers/codeComplexityController.js
const CodeComplexity = require("../model/codeComplexityModuleModel");

const createComplexityModule = async (req, res) => {
  try {
    const moduleName = req.body.name;
    const sourceCode = req.files.sourceCode[0].path;
    // Placeholder for actual complexity calculation
    const cyclomaticComplexity = 5;
    const weightedCompositeComplexity = 10;
    const complexityLevel = cyclomaticComplexity > 10 ? "High" : "Low";

    const newModule = new CodeComplexity({
      name: moduleName,
      sourceCodePath: sourceCode,
      complexityLevel,
      cyclomaticComplexity,
      weightedCompositeComplexity,
      sourceCode,
    });

    await newModule.save();
    res.status(201).json({ message: "Module uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComplexityReport = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const module = await CodeComplexity.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const report = {
      complexityLevel: module.complexityLevel,
      cyclomaticComplexity: module.cyclomaticComplexity,
      weightedCompositeComplexity: module.weightedCompositeComplexity,
      sourceCode: module.sourceCode,
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDetailedComplexityReport = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const module = await CodeComplexity.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Assume detailed complexity report is stored in the module
    const detailedReport = {
      complexityLevel: module.complexityLevel,
      cyclomaticComplexity: module.cyclomaticComplexity,
      weightedCompositeComplexity: module.weightedCompositeComplexity,
      uncoveredBranches: module.uncoveredBranches,
      uncoveredLines: module.uncoveredLines,
      sourceCode: module.sourceCode,
    };

    res.status(200).json(detailedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComplexityModule,
  getComplexityReport,
  getDetailedComplexityReport,
};
