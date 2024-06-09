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

module.exports = {
  calculateTestCoverage,
  saveTestCoverage,
  getTestCoverage,
};
