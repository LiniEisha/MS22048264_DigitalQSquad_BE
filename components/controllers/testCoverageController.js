const path = require('path');
const { exec } = require('child_process');
const TestCoverage = require('../models/testCoverageModel');

const calculateTestCoverage = (testFilesPath) => {
  return new Promise((resolve, reject) => {
    const nycPath = path.resolve(process.cwd(), 'node_modules/.bin/nyc');
    const mochaPath = path.resolve(process.cwd(), 'node_modules/.bin/mocha');
    const coverageCommand = `${nycPath} --reporter=json-summary ${mochaPath} ${testFilesPath}`;

    console.log('Coverage command:', coverageCommand);

    exec(coverageCommand, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(`exec error: ${error}`);
        return;
      }

      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      try {
        const coverage = require(coveragePath);
        const lineCoverage = coverage.total.lines.pct;
        const branchCoverage = coverage.total.branches.pct;
        resolve({ lineCoverage, branchCoverage });
      } catch (readError) {
        console.error(`Error reading coverage file: ${readError}`);
        reject(`Error reading coverage file: ${readError}`);
      }
    });
  });
};

const saveTestCoverage = async (moduleName, unitTestCoverage, automationTestCoverage) => {
  const totalLineCoverage = (unitTestCoverage.lineCoverage + automationTestCoverage.lineCoverage) / 2;
  const totalBranchCoverage = (unitTestCoverage.branchCoverage + automationTestCoverage.branchCoverage) / 2;

  const newCoverage = new TestCoverage({
    moduleName,
    unitTestCoverage: totalLineCoverage,
    automationTestCoverage: totalBranchCoverage,
    totalCoverage: (totalLineCoverage + totalBranchCoverage) / 2,
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
  const { moduleName, unitTestPath, automationPath } = req.body;

  try {
    let unitTestCoverage = { lineCoverage: 0, branchCoverage: 0 };
    let automationTestCoverage = { lineCoverage: 0, branchCoverage: 0 };

    if (unitTestPath) {
      console.log(`Unit test path: ${unitTestPath}`);
      unitTestCoverage = await calculateTestCoverage(unitTestPath);
    }

    if (automationPath) {
      console.log(`Automation test path: ${automationPath}`);
      automationTestCoverage = await calculateTestCoverage(automationPath);
    }

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
