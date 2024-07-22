const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { calculateCyclomaticComplexity, calculateWeightedCompositeComplexity } = require('../controllers/com');
const TestCoverage = require('../models/testCoverageModel');
const ComplexityResult = require('../models/complexityModel');
const { calculateAndSaveCoverage, getTestCoverage, getCoverageById } = require('../controllers/testCoverageController');
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
      } else if (weightedCompositeComplexity <= 466) {
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
    const runCoverageCalculation = async (testFilePath, suiteType, sourceFilePath) => {
      const testDir = path.dirname(testFilePath);
      const testFileName = path.basename(testFilePath);
      const sourceFileName = path.basename(sourceFilePath);
      const targetSourcePath = path.join(testDir, sourceFileName);

      console.log(`Copying source file to ${suiteType} directory:`, targetSourcePath);
      await fs.copyFile(sourceFilePath, targetSourcePath);

      console.log(`Calculating ${suiteType} coverage`);
      const coverageDir = path.join(testDir, 'coverage');
      await fs.mkdir(coverageDir, { recursive: true });

      const command = `npx nyc --report-dir=${coverageDir} --reporter=json-summary --reporter=json --reporter=html npx mocha ${testFileName} --no-interactive`;
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
            const coverageReportPath = path.join(coverageDir, 'coverage-final.json');
            const coverageReport = require(coverageReportPath);

            const totalLines = coverageSummary.total.lines.total;
            const executedLines = coverageSummary.total.lines.covered;
            const totalBranches = coverageSummary.total.branches.total;
            const executedBranches = coverageSummary.total.branches.covered;
            console.log('Total Lines:', totalLines);
            console.log('Executed Lines:', executedLines);
            console.log('Total Branches:', totalBranches);
            console.log('Executed Branches:', executedBranches);

            const { lines, branches } = coverageSummary.total;
            resolve({
              lineCoverage: lines.pct,
              branchCoverage: branches.pct,
              report: coverageReport, // Ensure the report is included
              totalLines,
              executedLines,
              totalBranches,
              executedBranches,
            });
          } catch (coverageError) {
            console.error('Coverage file read error:', coverageError);
            reject(coverageError);
          }
        });
      });
    };

    let unitTestCoverage = { lineCoverage: 0, branchCoverage: 0, totalLines: 0, executedLines: 0, totalBranches: 0, executedBranches: 0 };
    let automationTestCoverage = { lineCoverage: 0, branchCoverage: 0, totalLines: 0, executedLines: 0, totalBranches: 0, executedBranches: 0 };

    // Calculate Unit Test Coverage
    if (unitTestFile) {
      try {
        unitTestCoverage = await runCoverageCalculation(unitTestFilePath, 'unit test', sourceFilePath);
        console.log('Unit test coverage:', unitTestCoverage);
      } catch (err) {
        console.error('Error calculating unit test coverage:', err.message);
      }
    }

    // Calculate Automation Test Coverage
    if (automationFile) {
      try {
        automationTestCoverage = await runCoverageCalculation(automationFilePath, 'automation test', sourceFilePath);
        console.log('Automation test coverage:', automationTestCoverage);
      } catch (err) {
        console.error('Error calculating automation test coverage:', err.message);
      }
    }

    // Combine and Save Coverage Results
    const totalLineCoverage = (unitTestCoverage.lineCoverage + automationTestCoverage.lineCoverage) / 2;
    const totalBranchCoverage = (unitTestCoverage.branchCoverage + automationTestCoverage.branchCoverage) / 2;

    // Annotate Source Code
    const annotateSourceCode = async (sourceCodePath, coverageReport) => {
      const sourceCode = await fs.readFile(sourceCodePath, 'utf8');
      const executedLines = coverageReport?.lines?.details;

      if (!executedLines) {
        console.error('No executed lines found in coverage report');
        return sourceCode; // Return original source code if no details found
      }

      console.log('Executing lines:', executedLines); // Log executed lines

      const annotatedLines = sourceCode.split('\n').map((line, index) => {
        const lineNumber = index + 1;
        const executed = executedLines[lineNumber] && executedLines[lineNumber].covered;
        return executed ? `<mark>${line}</mark>` : line;
      });

      const annotatedSourceCode = annotatedLines.join('\n');
      console.log('Annotated Source Code:', annotatedSourceCode); // Log annotated source code
      return annotatedSourceCode;
    };

    // Annotate and Save Source Code
    const annotatedSourceCode = await annotateSourceCode(sourceFilePath, unitTestCoverage.report);
    const newModule = new TestCoverage({
      moduleName,
      unitTestLineCoverage: unitTestCoverage.lineCoverage,
      unitTestBranchCoverage: unitTestCoverage.branchCoverage,
      automationLineCoverage: automationTestCoverage.lineCoverage,
      automationBranchCoverage: automationTestCoverage.branchCoverage,
      totalLineCoverage,
      totalBranchCoverage,
      sourceCode,  // Save source code
      annotatedSourceCode,  // Save annotated source code
      totalLines: unitTestCoverage.totalLines + automationTestCoverage.totalLines,
      executedLines: unitTestCoverage.executedLines + automationTestCoverage.executedLines,
      totalBranches: unitTestCoverage.totalBranches + automationTestCoverage.totalBranches,
      executedBranches: unitTestCoverage.executedBranches + automationTestCoverage.executedBranches,
    });

    // Save the updated newModule with the calculated coverage values
    await newModule.save();
    console.log('Test coverage calculation successful:', newModule);

    res.status(201).send({ message: 'Upload successful', module: newModule });

  } catch (uploadError) {
    console.error('File upload failed:', uploadError.message);
    res.status(500).send({ error: 'Error uploading files' });
  } finally {
    try {
      if (sourceFilePath && await fs.access(sourceFilePath)) {
        await fs.unlink(sourceFilePath);
      }
      if (unitTestFilePath && await fs.access(unitTestFilePath)) {
        await fs.unlink(unitTestFilePath);
      }
      if (automationFilePath && await fs.access(automationFilePath)) {
        await fs.unlink(automationFilePath);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError.message);
    }
  }
});

router.get('/coverage', getTestCoverage);
router.get('/coverage/:id', getCoverageById);

module.exports = router;
