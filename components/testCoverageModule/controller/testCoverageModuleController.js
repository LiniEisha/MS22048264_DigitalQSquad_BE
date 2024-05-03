// controllers/moduleController.js
const Module = require("../model/testCoverageModuleModel");

const createCoverageModule = async (req, res) => {
  try {
    const moduleName = req.body.name;
    const sourceCode = req.files.sourceCode[0].path;
    const automationSuite = req.files.automationSuite[0].path;
    const unitTestSuite = req.files.unitTestSuite[0].path;

    const newModule = new testCoverage({
      name: moduleName,
      sourceCodePath: sourceCode,
      automationSuitePath: automationSuite,
      unitTestSuitePath: unitTestSuite,
    });

    await newModule.save();
    res.status(201).json({ message: "Module uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const listTestCoverage = async (req, res) => {
  try {
    const modules = await Module.find({});
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCoverageReport = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const module = await testCoverage.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Assume the report is stored in the module, you can customize this logic as per your needs
    const report = {
      totalCoverage: module.totalCoverage,
      totalLines: module.totalLines,
      uncoveredLines: module.uncoveredLines,
      branchesToCover: module.branchesToCover,
      totalUncoveredBranches: module.totalUncoveredBranches,
      branchCoverage: module.branchCoverage,
      sourceCode: module.sourceCode,
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDetailedCoverageReport = async (req, res) => {
  try {
    const moduleId = req.params.id;
    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    // Assume detailed coverage report is stored in the module
    const detailedReport = {
      totalCoverage: module.totalCoverage,
      totalLines: module.totalLines,
      uncoveredLines: module.uncoveredLines,
      branchesToCover: module.branchesToCover,
      totalUncoveredBranches: module.totalUncoveredBranches,
      branchCoverage: module.branchCoverage,
      uncoveredBranchDetails: module.uncoveredBranchDetails,
      uncoveredLineDetails: module.uncoveredLineDetails,
      sourceCode: module.sourceCode,
    };

    res.status(200).json(detailedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCoverageModule,
  listTestCoverage,
  getCoverageReport,
  getDetailedCoverageReport,
};
