const path = require('path');
const { exec } = require('child_process');
const TestCoverage = require('../models/testCoverageModel');
const fs = require('fs').promises;

const calculateTestCoverage = async (testFilePath, suiteType) => {
  const testDir = path.dirname(testFilePath);
  const testFileName = path.basename(testFilePath);
  return new Promise((resolve, reject) => {
    const command = `npx nyc --report-dir=${testDir}/coverage --reporter=json-summary --reporter=json --reporter=html npx mocha ${testFileName}`;

    console.log('Coverage command:', command);

    exec(command, { cwd: testDir }, (error, stdout, stderr) => {
      if (error) {
        console.error('exec error:', error);
        console.log('stderr:', stderr);
        return reject(error);
      }

      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      try {
        const coverageSummary = require(path.join(testDir, 'coverage', 'coverage-summary.json'));
        const coverageReport = require(path.join(testDir, 'coverage', 'coverage-final.json'));

        // Log detailed coverage report
        console.log('Coverage Summary:', JSON.stringify(coverageSummary, null, 2));
        console.log('Coverage Report:', JSON.stringify(coverageReport, null, 2));

        const { lines, branches } = coverageSummary.total;
        console.log('Branch Coverage:', branches.pct); // Log branch coverage

        resolve({
          lineCoverage: lines.pct,
          branchCoverage: branches.pct,
          report: coverageReport,
        });
      } catch (coverageError) {
        console.error('Coverage file read error:', coverageError);
        reject(coverageError);
      }
    });
  });
};


const saveTestCoverage = async (moduleName, unitTestCoverage, automationTestCoverage, annotatedSourceCode, sourceCodePath) => {
  const totalLineCoverage = (unitTestCoverage.lineCoverage + automationTestCoverage.lineCoverage) / 2;
  const totalBranchCoverage = (unitTestCoverage.branchCoverage + automationTestCoverage.branchCoverage) / 2;

  const sourceCode = await fs.readFile(sourceCodePath, 'utf8');

  const newCoverage = new TestCoverage({
    moduleName,
    unitTestLineCoverage: unitTestCoverage.lineCoverage,
    unitTestBranchCoverage: unitTestCoverage.branchCoverage,
    automationLineCoverage: automationTestCoverage.lineCoverage,
    automationBranchCoverage: automationTestCoverage.branchCoverage,
    totalLineCoverage,
    totalBranchCoverage,
    sourceCode,  // Save source code
    annotatedSourceCode,  // Save annotated source code
  });

  console.log('New Coverage to Save:', newCoverage);

  await newCoverage.save();
  return newCoverage;
};

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

const calculateAndSaveCoverage = async (req, res) => {
  const { moduleName } = req.body;

  try {
    const sourceFile = req.files.sourceCode ? req.files.sourceCode[0] : null;
    const unitTestFile = req.files.unitTestSuite ? req.files.unitTestSuite[0] : null;
    const automationFile = req.files.automationSuite ? req.files.automationSuite[0] : null;

    const sourceFilePath = sourceFile ? sourceFile.path : null;
    const unitTestFilePath = unitTestFile ? unitTestFile.path : null;
    const automationFilePath = automationFile ? automationFile.path : null;

    console.log('Extracted file paths:', { sourceFilePath, unitTestFilePath, automationFilePath });

    if (!sourceFilePath) {
      return res.status(400).send({ error: 'Source file is mandatory.' });
    }

    let unitTestCoverage = { lineCoverage: 0, branchCoverage: 0, report: {} };
    let automationTestCoverage = { lineCoverage: 0, branchCoverage: 0, report: {} };

    if (unitTestFilePath) {
      console.log(`Unit test path: ${unitTestFilePath}`);
      try {
        unitTestCoverage = await calculateTestCoverage(unitTestFilePath, 'unit test');
      } catch (err) {
        console.error('Error calculating unit test coverage:', err.message);
      }
    }

    if (automationFilePath) {
      console.log(`Automation test path: ${automationFilePath}`);
      try {
        automationTestCoverage = await calculateTestCoverage(automationFilePath, 'automation test');
      } catch (err) {
        console.error('Error calculating automation test coverage:', err.message);
      }
    }

    console.log('Unit Test Coverage:', unitTestCoverage);
    console.log('Automation Test Coverage:', automationTestCoverage);

    const annotatedSourceCode = await annotateSourceCode(sourceFilePath, unitTestCoverage.report);

    console.log('Annotated Source Code:', annotatedSourceCode);

    // Create a new instance for each upload
    const newCoverage = new TestCoverage({
      moduleName,
      unitTestLineCoverage: unitTestCoverage.lineCoverage,
      unitTestBranchCoverage: unitTestCoverage.branchCoverage,
      automationLineCoverage: automationTestCoverage.lineCoverage,
      automationBranchCoverage: automationTestCoverage.branchCoverage,
      totalLineCoverage: (unitTestCoverage.lineCoverage + automationTestCoverage.lineCoverage) / 2,
      totalBranchCoverage: (unitTestCoverage.branchCoverage + automationTestCoverage.branchCoverage) / 2,
      sourceCode: await fs.readFile(sourceFilePath, 'utf8'), // Read source code
      annotatedSourceCode,
      totalLines: unitTestCoverage.totalLines + automationTestCoverage.totalLines,
      executedLines: unitTestCoverage.executedLines + automationTestCoverage.executedLines,
      totalBranches: unitTestCoverage.totalBranches + automationTestCoverage.totalBranches,
      executedBranches: unitTestCoverage.executedBranches + automationTestCoverage.executedBranches,
    });

    console.log('New Coverage to Save:', newCoverage);

    await newCoverage.save();
    res.status(201).json({ message: 'Test coverage calculated and saved successfully', coverage: newCoverage });

    // Delay deletion of files until after the response
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
  } catch (error) {
    console.error('Error calculating and saving test coverage:', error.message);
    res.status(500).json({ error: 'Error calculating and saving test coverage' });
  }
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

const getCoverageById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching details for ID: ${id}`);
    const result = await TestCoverage.findById(id);
    if (!result) {
      console.log('Module not found');
      return res.status(404).send({ error: 'Module not found' });
    }
    console.log('Module found:', result);
    res.json(result);
  } catch (err) {
    console.error('Error fetching module details:', err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  calculateTestCoverage,
  saveTestCoverage,
  getTestCoverage,
  calculateAndSaveCoverage,
  getCoverageById,
  annotateSourceCode,
};
