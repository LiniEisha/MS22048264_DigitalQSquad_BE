const Module = require('../models/Module');
const fs = require('fs');

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

    const sourceFilePath = sourceFile.path;
    const unitTestFilePath = unitTestFile ? unitTestFile.path : null;
    const automationFilePath = automationFile ? automationFile.path : null;

    const newModule = new Module({
      moduleName,
      sourceCode: sourceFilePath,
      unitTestSuite: unitTestFilePath,
      automationSuite: automationFilePath,
    });

    await newModule.save();
    res.json({ message: 'Files uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
