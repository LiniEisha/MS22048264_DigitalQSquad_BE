const CodeComplexity = require("../model/codeComplexityModuleModel");
const fs = require("fs");
const {
  calculateCyclomaticComplexity,
  calculateWeightedCompositeComplexity,
} = require("../logic/complexityAnalysis");

const createComplexityModule = async (req, res) => {
  try {
    const moduleName = req.body.name;
    const sourceCodePath = req.files.sourceCode[0].path;
    const codeContent = fs.readFileSync(sourceCodePath, "utf8");

    // Calculate complexities
    const cyclomaticComplexity = calculateCyclomaticComplexity(codeContent);
    const weightedCompositeComplexity =
      calculateWeightedCompositeComplexity(codeContent);

    // Determine complexity level based on benchmarks
    let complexityLevel = "Normal";
    if (cyclomaticComplexity > 10 || weightedCompositeComplexity > 154.75) {
      complexityLevel = "Complex";
    }

    const newModule = new CodeComplexity({
      name: moduleName,
      sourceCodePath,
      complexityLevel,
      cyclomaticComplexity,
      weightedCompositeComplexity,
      sourceCode: codeContent, // Storing the source code itself, if necessary
    });

    await newModule.save();
    res.status(201).json({
      message: "Module uploaded successfully",
      complexityLevel,
      cyclomaticComplexity,
      weightedCompositeComplexity,
    });
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
