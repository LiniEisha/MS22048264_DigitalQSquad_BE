// controllers/testCoverageController.js
const path = require('path');
const { exec } = require('child_process');
const TestCoverage = require('../models/testCoverageModel');

const calculateTestCoverage = (modulePath, testType) => {
  return new Promise((resolve, reject) => {
    const coverageCommand = `nyc --reporter=json-summary mocha ${modulePath}/${testType}/*.js`;
    exec(coverageCommand, { cwd: modulePath }, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
        return;
      }
      const coveragePath = path.join(modulePath, 'coverage', 'coverage-summary.json');
      const coverage = require(coveragePath);
      const totalCoverage = coverage.total.lines.pct;
      resolve(totalCoverage);
    });
  });
};

const saveTestCoverage = async (moduleName, unitTestCoverage, automationTestCoverage) => {
  const totalCoverage = (unitTestCoverage + automationTestCoverage) / 2;
  const newCoverage = new TestCoverage({
    moduleName,
    unitTestCoverage,
    automationTestCoverage,
    totalCoverage,
  });
  await newCoverage.save();
  return newCoverage;
};

const getTestCoverage = async (req, res) => {
  try {
    const testCoverage = await TestCoverage.find();
    res.json(testCoverage);
  } catch (error) {
    console.error('Error fetching test coverage data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const calculateAndSaveCoverage = async (req, res) => {
  const { moduleName, sourceFilePath, unitTestPath, automationPath } = req.body;

  try {
    let unitTestCoverage = 0;
    let automationTestCoverage = 0;

    if (unitTestPath) {
      unitTestCoverage = await calculateTestCoverage(path.dirname(unitTestPath), 'unitTestSuite');
    }

    if (automationPath) {
      automationTestCoverage = await calculateTestCoverage(path.dirname(automationPath), 'automationSuite');
    }

    const totalCoverage = (unitTestCoverage + automationTestCoverage) / 2;

    const savedCoverage = await saveTestCoverage(moduleName, unitTestCoverage, automationTestCoverage);
    res.status(201).json({ message: 'Test coverage calculated and saved successfully', coverage: savedCoverage });
  } catch (error) {
    console.error('Error calculating and saving test coverage:', error.message);
    res.status(500).json({ error: 'Error calculating and saving test coverage' });
  }
};

module.exports = {
  calculateTestCoverage,
  saveTestCoverage,
  getTestCoverage,
  calculateAndSaveCoverage,
};
