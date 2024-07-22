const Module = require('../models/Module');
const fs = require('fs').promises;
const path = require('path');

exports.uploadModule = async (req, res) => {
  try {
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

    console.log('File paths:', { sourceFilePath, unitTestFilePath, automationFilePath });

    // Read source code from file
    const sourceCode = await fs.readFile(sourceFilePath, 'utf8');
    console.log('Source code read successfully');

    const newModule = new Module({
      moduleName,
      sourceCode: sourceFilePath,
      unitTestSuite: unitTestFilePath,
      automationSuite: automationFilePath,
    });

    // Save the module to the database
    await newModule.save();
    console.log('Module saved successfully:', newModule);
    res.json({ message: 'Files uploaded successfully', module: newModule });
  } catch (err) {
    console.error('Error saving module:', err);
    res.status(500).send('Server error');
  }
};
