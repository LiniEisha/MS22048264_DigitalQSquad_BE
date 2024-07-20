const path = require('path');
const { exec } = require('child_process');
const TestCoverage = require('../models/testCoverageModel');

const calculateTestCoverage = async (testFilePath, suiteType) => {
  const { exec } = require('child_process');
  const testDir = path.dirname(testFilePath);
  const testFileName = path.basename(testFilePath);
  return new Promise((resolve, reject) => {
    const command = `npx nyc --reporter=json-summary npx mocha ${testFileName}`;

    console.log('Coverage command:', command);

    exec(command, { cwd: testDir }, (error, stdout, stderr) => {
      if (error) {
        console.error('exec error:', error);
        return reject(error);
      }

      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      try {
        const coverageSummary = require(path.join(testDir, 'coverage', 'coverage-summary.json'));
        const { lines, branches } = coverageSummary.total;
        resolve({
          lineCoverage: lines.pct,
          branchCoverage: branches.pct,
        });
      } catch (coverageError) {
        console.error('Coverage file read error:', coverageError);
        reject(coverageError);
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
