const express = require('express');
const { getTestCoverage, calculateAndSaveCoverage, getCoverageById, annotateSourceCode } = require('../controllers/testCoverageController');
const Module = require('../models/Module');
const router = express.Router();

router.get('/', getTestCoverage);
router.post('/calculate', calculateAndSaveCoverage);
router.get('/:id', getCoverageById);  // Corrected route method


router.get('/annotated-source/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const module = await TestCoverage.findById(id);

    if (!module) {
      return res.status(404).send('Module not found');
    }

    res.json({ annotatedSourceCode: module.annotatedSourceCode });
  } catch (err) {
    console.error('Error fetching annotated source code:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;