const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ComplexityController = require('../controllers/complexityController');
const ComplexityResult = require('../models/complexityModel'); // Ensure this import is correct
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

    // Save complexity result
    const complexityResult = new ComplexityResult({
      moduleName,
      cyclomaticComplexity,
      weightedCompositeComplexity,
      complexity
    });
    const savedResult = await complexityResult.save();
    console.log('Saved complexity result:', savedResult);

    res.status(201).send({ message: 'Upload successful', complexityResult: savedResult });
  } catch (error) {
    console.error('Error calculating and saving complexity:', error);
    res.status(500).send({ error: 'Error calculating and saving complexity' });
  } finally {
    // Clean up uploaded files
    if (sourceFile) fs.unlinkSync(sourceFilePath);
  }
});

module.exports = router;
