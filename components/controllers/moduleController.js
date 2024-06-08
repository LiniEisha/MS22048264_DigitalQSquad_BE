const Module = require('../models/Module'); // Ensure correct path

exports.uploadModule = async (req, res) => {
  try {
    const { moduleName } = req.body;
    const sourceCode = req.files.sourceCode[0].path;
    const unitTestSuite = req.files.unitTestSuite ? req.files.unitTestSuite[0].path : null;
    const automationSuite = req.files.automationSuite ? req.files.automationSuite[0].path : null;

    const newModule = new Module({
      moduleName,
      sourceCode,
      unitTestSuite,
      automationSuite,
    });

    await newModule.save();
    res.json({ message: 'Files uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
