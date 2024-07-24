// File: testCoverageController.js
import path from 'path';
import { exec } from 'child_process';
import TestCoverage from '../models/testCoverageModel.js';
import fs from 'fs/promises';

const calculateTestCoverage = async (testFilePath, suiteType) => {
  const testDir = path.dirname(testFilePath);
  const testFileName = path.basename(testFilePath);
  const coverageDir = path.join(testDir, 'coverage');

  console.log(`Calculating ${suiteType} coverage`);
  await fs.rm(coverageDir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(coverageDir, { recursive: true });

  const command = `npx nyc --report-dir=${coverageDir} --reporter=json-summary --reporter=json --reporter=html mocha --require @babel/register ${testFileName} --no-interactive`;
  console.log('Coverage command:', command);

  return new Promise((resolve, reject) => {
    exec(command, { cwd: testDir }, async (error, stdout, stderr) => {
      if (error) {
        console.error('exec error:', error);
        console.log('stderr:', stderr);
        return reject(error);
      }

      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      try {
        const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json');
        const coverageReportPath = path.join(coverageDir, 'coverage-final.json');

        const coverageSummaryExists = await fs.access(coverageSummaryPath).then(() => true).catch(() => false);
        const coverageReportExists = await fs.access(coverageReportPath).then(() => true).catch(() => false);

        if (!coverageSummaryExists || !coverageReportExists) {
          console.error('Coverage files not found');
          return reject(new Error('Coverage files not found'));
        }

        const coverageSummary = JSON.parse(await fs.readFile(coverageSummaryPath, 'utf8'));
        const coverageReport = JSON.parse(await fs.readFile(coverageReportPath, 'utf8'));

        const totalLines = coverageSummary.total.lines.total;
        const executedLines = coverageSummary.total.lines.covered;
        const totalBranches = coverageSummary.total.branches.total;
        const executedBranches = coverageSummary.total.branches.covered;
        console.log('Total Lines:', totalLines);
        console.log('Executed Lines:', executedLines);
        console.log('Total Branches:', totalBranches);
        console.log('Executed Branches:', executedBranches);

        resolve({
          lineCoverage: coverageSummary.total.lines.pct || 0,
          branchCoverage: coverageSummary.total.branches.pct || 0,
          report: coverageReport,
          totalLines: totalLines || 0,
          executedLines: executedLines || 0,
          totalBranches: totalBranches || 0,
          executedBranches: executedBranches || 0,
        });
      } catch (coverageError) {
        console.error('Coverage file read error:', coverageError);
        reject(coverageError);
      }
    });
  });
};

const saveTestCoverage = async (moduleName, unitTestCoverage, automationTestCoverage, annotatedSourceCode, sourceCodePath) => {
  // const totalLineCoverage = (unitTestCoverage.lineCoverage + automationTestCoverage.lineCoverage) / 2;
  // const totalBranchCoverage = (unitTestCoverage.branchCoverage + automationTestCoverage.branchCoverage) / 2;
  const totalLineCoverage = unitTestCoverage.lineCoverage;
  const totalBranchCoverage = unitTestCoverage.branchCoverage;

  const sourceCode = await fs.readFile(sourceCodePath, 'utf8');

  const newCoverage = new TestCoverage({
    moduleName,
    unitTestLineCoverage: unitTestCoverage.lineCoverage || 0,
    unitTestBranchCoverage: unitTestCoverage.branchCoverage || 0,
    automationLineCoverage: automationTestCoverage.lineCoverage || 0,
    automationBranchCoverage: automationTestCoverage.branchCoverage || 0,
    totalLineCoverage: totalLineCoverage || 0,
    totalBranchCoverage: totalBranchCoverage || 0,
    sourceCode,
    annotatedSourceCode,
    totalLines: unitTestCoverage.totalLines + automationTestCoverage.totalLines || 0,
    executedLines: unitTestCoverage.executedLines + automationTestCoverage.executedLines || 0,
    totalBranches: unitTestCoverage.totalBranches + automationTestCoverage.totalBranches || 0,
    executedBranches: unitTestCoverage.executedBranches + automationTestCoverage.executedBranches || 0,
  });

  console.log('New Coverage to Save:', newCoverage);

  await newCoverage.save();
  return newCoverage;
};

async function calculateAndSaveCoverage(moduleName, sourceFilePath, unitTestFilePath, automationFilePath) {
  const unitTestCoverage = unitTestFilePath ? await calculateTestCoverage(unitTestFilePath, 'unit test') : {
    lineCoverage: 0,
    branchCoverage: 0,
    totalLines: 0,
    executedLines: 0,
    totalBranches: 0,
    executedBranches: 0
  };

  const automationTestCoverage = automationFilePath ? await calculateTestCoverage(automationFilePath, 'automation test') : {
    lineCoverage: 0,
    branchCoverage: 0,
    totalLines: 0,
    executedLines: 0,
    totalBranches: 0,
    executedBranches: 0
  };

  const annotatedSourceCode = await annotateSourceCode(sourceFilePath, unitTestCoverage.report);
  return await saveTestCoverage(moduleName, unitTestCoverage, automationTestCoverage, annotatedSourceCode, sourceFilePath);
}

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

const getTestCoverage = async (req, res) => {
  try {
    const testCoverage = await TestCoverage.find();
    res.json(testCoverage);
  } catch (error) {
    console.error('Error fetching test coverage data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getModulesWithLowCoverage = async (req, res) => {
  console.log('Request to /low-coverage received');
  try {
    const lowCoverageModules = await TestCoverage.find({
      $or: [
        { unitTestLineCoverage: { $lt: 80 } },
        { totalBranchCoverage: { $lt: 75 } }
      ]
    });
    console.log('Low coverage modules fetched:', lowCoverageModules);
    res.json(lowCoverageModules);
  } catch (err) {
    console.error('Error fetching modules with low coverage:', err);
    res.status(500).send({ error: 'Internal Server Error', details: err.message });
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


export {
  calculateTestCoverage,
  saveTestCoverage,
  getTestCoverage,
  calculateAndSaveCoverage,
  getCoverageById,
  annotateSourceCode,
  getModulesWithLowCoverage, 
};
