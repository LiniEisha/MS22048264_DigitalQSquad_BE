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
        const coverageSummaryPath = path.join(testDir, 'coverage', 'coverage-summary.json');
        const coverageSummary = require(coverageSummaryPath);
        const coverageReportPath = path.join(testDir, 'coverage', 'coverage-final.json');
        const coverageReport = require(coverageReportPath);

        const { lines, branches } = coverageSummary.total;

        console.log('Line Coverage:', lines.pct);
        console.log('Branch Coverage:', branches.pct);

        resolve({
          lineCoverage: lines.pct,
          branchCoverage: branches.pct,
          report: coverageReport,
          totalLines: coverageSummary.total.lines.total,
          executedLines: coverageSummary.total.lines.covered,
          totalBranches: coverageSummary.total.branches.total,
          executedBranches: coverageSummary.total.branches.covered,
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
    totalLines: unitTestCoverage.totalLines + automationTestCoverage.totalLines,
    executedLines: unitTestCoverage.executedLines + automationTestCoverage.executedLines,
    totalBranches: unitTestCoverage.totalBranches + automationTestCoverage.totalBranches,
    executedBranches: unitTestCoverage.executedBranches + automationTestCoverage.executedBranches,
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

async function calculateAndSaveCoverage(moduleName, sourceFilePath, unitTestFilePath, automationFilePath) {
  const coverageDir = path.join(path.dirname(sourceFilePath), 'coverage');

  const readCoverageSummary = async () => {
    const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json');
    try {
      const coverageSummary = require(coverageSummaryPath);
      return coverageSummary;
    } catch (error) {
      console.error('Error reading coverage summary:', error.message);
      return null;
    }
  };

  const readCoverageFinal = async () => {
    const coverageFinalPath = path.join(coverageDir, 'coverage-final.json');
    try {
      const coverageFinal = require(coverageFinalPath);
      return coverageFinal;
    } catch (error) {
      console.error('Error reading coverage final:', error.message);
      return {};
    }
  };

  const unitTestCoverage = await runCoverageCalculation(unitTestFilePath, 'unit test', sourceFilePath);
  const automationTestCoverage = await runCoverageCalculation(automationFilePath, 'automation test', sourceFilePath);

  const totalLineCoverage = (unitTestCoverage.lineCoverage + automationTestCoverage.lineCoverage) / 2;
  const totalBranchCoverage = (unitTestCoverage.branchCoverage + automationTestCoverage.branchCoverage) / 2;

  const newModule = new TestCoverage({
    moduleName,
    unitTestLineCoverage: unitTestCoverage.lineCoverage,
    unitTestBranchCoverage: unitTestCoverage.branchCoverage,
    automationLineCoverage: automationTestCoverage.lineCoverage,
    automationBranchCoverage: automationTestCoverage.branchCoverage,
    totalLineCoverage,
    totalBranchCoverage,
    sourceCode: await fs.readFile(sourceFilePath, 'utf8'),
    annotatedSourceCode: await annotateSourceCode(sourceFilePath, unitTestCoverage.report),
    totalLines: unitTestCoverage.totalLines + automationTestCoverage.totalLines,
    executedLines: unitTestCoverage.executedLines + automationTestCoverage.executedLines,
    totalBranches: unitTestCoverage.totalBranches + automationTestCoverage.totalBranches,
    executedBranches: unitTestCoverage.executedBranches + automationTestCoverage.executedBranches,
  });

  await newModule.save();
  console.log('Test coverage saved:', newModule);

  return newModule;
}


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
