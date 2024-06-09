const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { calculateCyclomaticComplexity, calculateWeightedCompositeComplexity } = require('../controllers/complexityController');
const ComplexityResult = require('../models/complexityModel');
const Module = require('../models/Module');
const { calculateTestCoverage, saveTestCoverage } = require('../controllers/testCoverageController');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.fields([
  { name: 'sourceCode', maxCount: 1 },
  { name: 'unitTestSuite', maxCount: 1 },
  { name: 'automationSuite', maxCount: 1 }
]), async (req, res) => {
  const { moduleName } = req.body;
  const sourceFile = req.files.sourceCode ? req.files.sourceCode[0] : null;
  const unitTestFile = req.files.unitTestSuite ? req.files.unitTestSuite[0] : null;
  const automationFile = req.files.automationSuite ? req.files.automationSuite[0] : null;

  if (!sourceFile) {
    return res.status(400).send({ error: 'Source file is mandatory.' });
  }

  if (!unitTestFile && !automationFile) {
    return res.status(400).send({ error: 'At least one of unit test file or automation file is mandatory.' });
  }

  const sourceFilePath = sourceFile.path;

  try {
    // Save new module
    const newModule = new Module({
      moduleName,
      sourceCode: sourceFilePath,
      unitTestSuite: unitTestFile ? unitTestFile.path : null,
      automationSuite: automationFile ? automationFile.path : null,
    });

    const savedModule = await newModule.save();

    res.status(201).send({ message: 'Upload successful', module: savedModule });

    // Complexity Calculation
    try {
      const sourceCode = fs.readFileSync(sourceFilePath, 'utf8');
      console.log('Received module name:', moduleName);
      console.log('Received source code:', sourceCode);

      // Validate the source code
      if (!isValidSourceCode(sourceCode)) {
        throw new Error('Source code contains syntax errors.');
      }

      // Before calling the complexity calculation functions
console.log('Calling calculateCyclomaticComplexity with source code:', sourceCode);
console.log('Calling calculateWeightedCompositeComplexity with source code:', sourceCode);


      const cyclomaticComplexity = calculateCyclomaticComplexity(sourceCode);
      const weightedCompositeComplexity = calculateWeightedCompositeComplexity(sourceCode);
      let complexityLevel = 'Low';
      if (cyclomaticComplexity > 10 || weightedCompositeComplexity > 154.75) {
        complexityLevel = 'High';
      }

      const complexityResult = new ComplexityResult({
        moduleName,
        cyclomaticComplexity,
        weightedCompositeComplexity,
        complexityLevel
      });

      await complexityResult.save();
      console.log('Complexity calculation successful:', complexityResult);

    } catch (complexityError) {
      console.error('Complexity calculation failed:', complexityError.message);
    }

    // Test Coverage Calculation
    try {
      let unitTestCoverage = 0;
      let automationTestCoverage = 0;
      
      if (unitTestFile) {
        unitTestCoverage = await calculateTestCoverage(path.dirname(unitTestFile.path), 'unitTestSuite');
      }

      if (automationFile) {
        automationTestCoverage = await calculateTestCoverage(path.dirname(automationFile.path), 'automationSuite');
      }

      const totalCoverage = (unitTestCoverage + automationTestCoverage) / 2;

      savedModule.unitTestCoverage = unitTestCoverage;
      savedModule.automationTestCoverage = automationTestCoverage;
      savedModule.totalCoverage = totalCoverage;

      await savedModule.save();
      console.log('Test coverage calculation successful:', savedModule);

    } catch (coverageError) {
      console.error('Test coverage calculation failed:', coverageError.message);
    }

  } catch (uploadError) {
    console.error('File upload failed:', uploadError.message);
    res.status(500).send({ error: 'Error uploading files' });
  } finally {
    if (sourceFile) fs.unlinkSync(sourceFilePath);
    if (unitTestFile) fs.unlinkSync(unitTestFile.path);
    if (automationFile) fs.unlinkSync(automationFile.path);
  }
});

// Helper function to validate source code
function isValidSourceCode(sourceCode) {
  try {
    new Function(sourceCode);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = router;
