const express = require('express');
const { getTestCoverage, calculateAndSaveCoverage, getCoverageById } = require('../controllers/testCoverageController');

const router = express.Router();

router.get('/', getTestCoverage);
router.post('/calculate', calculateAndSaveCoverage);
router.get('/:id', getCoverageById);  // Corrected route method

module.exports = router;

