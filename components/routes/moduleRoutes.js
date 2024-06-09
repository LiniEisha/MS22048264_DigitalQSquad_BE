const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ComplexityController = require('../controllers/complexityController');
const ComplexityResult = require('../models/complexityModel');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.fields([
  { name: 'sourceCode', maxCount: 1 },
  { name: 'unitTestSuite', maxCount: 1 },
  { name: 'automationSuite', maxCount: 1 }
]), async (req, res) => {
  const { moduleName } = req.body;
  const sourceFile = req.files.sourceCode ? req.files.sourceCode[0] : null;
  
  if (!sourceFile) {
    return res.status(400).send({ error: 'Source file is mandatory.' });
  }

  const sourceFilePath = sourceFile.path;
  const sourceCode = fs.readFileSync(sourceFilePath, 'utf8');

  console.log('Received module name:', moduleName);
  console.log('Received source code:', sourceCode);

  try {
    // Calculate complexity
    const cyclomaticComplexity = ComplexityController.calculateCyclomaticComplexity(sourceCode);
    const weightedCompositeComplexity = ComplexityController.calculateWeightedCompositeComplexity(sourceCode);
    let complexity = 'Low';
    if (cyclomaticComplexity > 10 || weightedCompositeComplexity > 154.75) {
      complexity = 'High';
    }

    // Log calculated complexities
    console.log('Cyclomatic Complexity:', cyclomaticComplexity);
    console.log('Weighted Composite Complexity:', weightedCompositeComplexity);

    // Save complexity result
    const complexityResult = new ComplexityResult({
      moduleName,
      cyclomaticComplexity,
      weightedCompositeComplexity,
      complexity
    });
    const savedResult = await complexityResult.save();
    console.log('Saved complexity result:', savedResult);

  // Calculate test coverage
  const newModule = new Module({
    moduleName,
    sourceCode: sourceFilePath,
    unitTestSuite: req.files.unitTestSuite ? req.files.unitTestSuite[0].path : null,
    automationSuite: req.files.automationSuite ? req.files.automationSuite[0].path : null,
  });

  await newModule.save();

  let unitTestCoverage = 0;
  let automationTestCoverage = 0;
  try {
    unitTestCoverage = newModule.unitTestSuite ? await calculateTestCoverage(path.dirname(newModule.unitTestSuite), 'unitTestSuite') : 0;
  } catch (coverageError) {
    console.error('Error calculating unit test coverage:', coverageError.message);
  }

  try {
    automationTestCoverage = newModule.automationSuite ? await calculateTestCoverage(path.dirname(newModule.automationSuite), 'automationSuite') : 0;
  } catch (coverageError) {
    console.error('Error calculating automation test coverage:', coverageError.message);
  }

  const totalCoverage = (unitTestCoverage + automationTestCoverage) / 2;

  newModule.unitTestCoverage = unitTestCoverage;
  newModule.automationTestCoverage = automationTestCoverage;
  newModule.totalCoverage = totalCoverage;

  await newModule.save();

  res.status(201).send({ message: 'Upload successful', complexityResult: savedResult, module: newModule });
} catch (error) {
  console.error('Error calculating and saving complexity or coverage:', error.message);
  res.status(500).send({ error: 'Error calculating and saving complexity or coverage' });
} finally {
  // Clean up uploaded files
  if (sourceFile) fs.unlinkSync(sourceFilePath);
}
});

module.exports = router;