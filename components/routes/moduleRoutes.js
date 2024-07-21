const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { calculateCyclomaticComplexity, calculateWeightedCompositeComplexity } = require('../controllers/com');
const TestCoverage = require('../models/testCoverageModel');
const ComplexityResult = require('../models/complexityModel');
const router = express.Router();

// Configure multer storage to retain original filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.fields([
  { name: 'sourceCode', maxCount: 1 },
  { name: 'unitTestSuite', maxCount: 1 },
  { name: 'automationSuite', maxCount: 1 }
]), async (req, res) => {
  const { moduleName } = req.body;
  const sourceFile = req.files.sourceCode ? req.files.sourceCode[0] : null;
  const unitTestFile = req.files.unitTestSuite ? req.files.unitTestSuite[0] : null;
  const automationFile = req.files.automationSuite ? req.files.automationSuite[0] : null;

  console.log('Received files:', { sourceFile, unitTestFile, automationFile });

  if (!sourceFile) {
    return res.status(400).send({ error: 'Source file is mandatory.' });
  }

  if (!unitTestFile && !automationFile) {
    return res.status(400).send({ error: 'At least one of unit test file or automation file is mandatory.' });
  }

  const sourceFilePath = path.resolve(sourceFile.path);
  const unitTestFilePath = unitTestFile ? path.resolve(unitTestFile.path) : null;
  const automationFilePath = automationFile ? path.resolve(automationFile.path) : null;

  console.log('File paths:', { sourceFilePath, unitTestFilePath, automationFilePath });

  try {
    const sourceCode = await fs.readFile(sourceFilePath, 'utf8');
    console.log('Source code read successfully');

    const newModule = new TestCoverage({
      moduleName,
      unitTestLineCoverage: 0,
      unitTestBranchCoverage: 0,
      automationLineCoverage: 0,
      automationBranchCoverage: 0,
      totalLineCoverage: 0,
      totalBranchCoverage: 0,
      sourceCode,  // Save source code
    });

    await newModule.save();
    console.log('Module saved successfully:', newModule);

    // Complexity Calculation
    try {
      console.log('Starting complexity calculation');
      const cyclomaticComplexity = calculateCyclomaticComplexity(sourceCode);
      const weightedCompositeComplexity = calculateWeightedCompositeComplexity(sourceCode);
      let complexityLevel = 'Low';
      if (cyclomaticComplexity > 10) {
        complexityLevel = "Complex";
      } else {
        complexityLevel = "Low";
      }

      if (weightedCompositeComplexity <= 46.74) {
        complexityLevel = "Low";
      } else if (weightedCompositeComplexity <= 182.58) {
        complexityLevel = "Moderate";
      } else if (weightedCompositeCompositeComplexity <= 466) {
        complexityLevel = "Complex";
      } else {
        complexityLevel = "High Complex";
      }

      const complexityResult = new ComplexityResult({
        moduleName,
        cyclomaticComplexity,
        weightedCompositeComplexity,
        complexityLevel,
        sourceCode, // Save source code
      });

      await complexityResult.save();
      console.log('Complexity calculation successful:', complexityResult);

    } catch (complexityError) {
      console.error('Complexity calculation failed:', complexityError.message);
    }

    // Test Coverage Calculation
    const runCoverageCalculation = async (testFilePath, suiteType) => {
      const testDir = path.dirname(testFilePath);
      const testFileName = path.basename(testFilePath);
      const sourceFileName = path.basename(sourceFile.path);
      const targetSourcePath = path.join(testDir, sourceFileName);

      console.log(`Copying source file to ${suiteType} directory:`, targetSourcePath);
      await fs.copyFile(sourceFilePath, targetSourcePath);

      console.log(`Calculating ${suiteType} coverage`);
      const coverageDir = path.join(testDir, 'coverage');
      await fs.mkdir(coverageDir, { recursive: true });

      const command = `npx nyc --report-dir=${coverageDir} --reporter=json-summary npx mocha ${testFileName} --no-interactive`;
      console.log('Coverage command:', command);

      const { exec } = require('child_process');
      return new Promise((resolve, reject) => {
        exec(command, { cwd: testDir }, async (error, stdout, stderr) => {
          if (error) {
            console.error('exec error:', error);
            console.log('stderr:', stderr);
            return reject(error);
          }

          console.log('stdout:', stdout);

          try {
            const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json');
            const coverageSummary = require(coverageSummaryPath);
            const { lines, branches } = coverageSummary.total;
            resolve({
              lineCoverage: lines.pct,
              branchCoverage: branches.pct,
            });
          } catch (coverageError) {
            console.error('Coverage file read error:', coverageError);
            reject(coverageError);
          } finally {
            await fs.unlink(targetSourcePath);
          }
        });
      });
    };

    let unitTestCoverage = { lineCoverage: 0, branchCoverage: 0 };
    let automationTestCoverage = { lineCoverage: 0, branchCoverage: 0 };

    // Calculate Unit Test Coverage
    if (unitTestFile) {
      try {
        unitTestCoverage = await runCoverageCalculation(unitTestFilePath, 'unit test');
        console.log('Unit test coverage:', unitTestCoverage);
      } catch (err) {
        console.error('Error calculating unit test coverage:', err.message);
      }
    }

    // Calculate Automation Test Coverage
    if (automationFile) {
      try {
        automationTestCoverage = await runCoverageCalculation(automationFilePath, 'automation test');
        console.log('Automation test coverage:', automationTestCoverage);
      } catch (err) {
        console.error('Error calculating automation test coverage:', err.message);
      }
    }

    // Combine and Save Coverage Results
    const totalLineCoverage = (unitTestCoverage.lineCoverage + automationTestCoverage.lineCoverage) / 2;
    const totalBranchCoverage = (unitTestCoverage.branchCoverage + automationTestCoverage.branchCoverage) / 2;

    // Update the newModule object with the calculated coverage values
    newModule.unitTestLineCoverage = unitTestCoverage.lineCoverage;
    newModule.unitTestBranchCoverage = unitTestCoverage.branchCoverage;
    newModule.automationLineCoverage = automationTestCoverage.lineCoverage;
    newModule.automationBranchCoverage = automationTestCoverage.branchCoverage;
    newModule.totalLineCoverage = totalLineCoverage;
    newModule.totalBranchCoverage = totalBranchCoverage;

    // Save the updated newModule with the calculated coverage values
    await newModule.save();
    console.log('Test coverage calculation successful:', newModule);

    res.status(201).send({ message: 'Upload successful', module: newModule });

  } catch (uploadError) {
    console.error('File upload failed:', uploadError.message);
    res.status(500).send({ error: 'Error uploading files' });
  } finally {
    try {
      if (sourceFilePath) {
        await fs.unlink(sourceFilePath);
      }
      if (unitTestFilePath) {
        await fs.unlink(unitTestFilePath);
      }
      if (automationFilePath) {
        await fs.unlink(automationFilePath);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }
  }
});

module.exports = router;
