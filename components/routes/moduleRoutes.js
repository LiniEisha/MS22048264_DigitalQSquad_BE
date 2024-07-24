// File: moduleRoutes.js
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { calculateCyclomaticComplexity, calculateWeightedCompositeComplexity } from '../controllers/com.js';
import TestCoverage from '../models/testCoverageModel.js';
import ComplexityResult from '../models/complexityModel.js';
import { calculateAndSaveCoverage, getTestCoverage, getCoverageById } from '../controllers/testCoverageController.js';

const router = express.Router();

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

  if (!sourceFile) {
    return res.status(400).send({ error: 'Source file is mandatory.' });
  }

  if (!unitTestFile && !automationFile) {
    return res.status(400).send({ error: 'At least one of unit test file or automation file is mandatory.' });
  }

  const sourceFilePath = path.resolve(sourceFile.path);
  const unitTestFilePath = unitTestFile ? path.resolve(unitTestFile.path) : null;
  const automationFilePath = automationFile ? path.resolve(automationFile.path) : null;

  console.log('Source file path:', sourceFilePath);
  console.log('Unit test file path:', unitTestFilePath);
  console.log('Automation file path:', automationFilePath);

  let originalSourceCode;
  try {
    originalSourceCode = await fs.readFile(sourceFilePath, 'utf8');
    console.log('Original source code read successfully');

    // Complexity Calculation
    try {
      const cyclomaticComplexity = calculateCyclomaticComplexity(originalSourceCode);
      const weightedCompositeComplexity = calculateWeightedCompositeComplexity(originalSourceCode);
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
        sourceCode: originalSourceCode,
      });

      await complexityResult.save();
      console.log('Complexity calculation successful');

    } catch (complexityError) {
      console.error('Complexity calculation failed:', complexityError.message);
    }

    // Instrument the original file in-place
    await new Promise((resolve, reject) => {
      const command = `npx nyc instrument --in-place ${sourceFilePath}`;
      console.log('Executing instrumentation command:', command);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Instrumentation error:', error);
          console.log('stderr:', stderr);
          reject(error);
        } else {
          console.log('Instrumentation stdout:', stdout);
          console.log('Instrumentation stderr:', stderr);
          resolve();
        }
      });
    });

    // Test Coverage Calculation
    try {
      const newModule = await calculateAndSaveCoverage(moduleName, sourceFilePath, unitTestFilePath, automationFilePath);
      res.status(201).send({ message: 'Upload successful', module: newModule });
    } catch (coverageError) {
      console.error('Coverage calculation failed:', coverageError.message);
      res.status(500).send({ error: 'Error calculating coverage' });
    }

  } catch (uploadError) {
    console.error('File upload failed:', uploadError.message);
    res.status(500).send({ error: 'Error uploading files' });
  } finally {
    try {
      if (originalSourceCode) {
        await fs.writeFile(sourceFilePath, originalSourceCode, 'utf8');
        console.log('Original source code restored');
      }
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

export default router;
