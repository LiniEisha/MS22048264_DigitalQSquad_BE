// routes/testCoverageRoutes.js
const express = require('express');
const { getTestCoverage, calculateAndSaveCoverage } = require('../controllers/testCoverageController');

const router = express.Router();

router.get('/', getTestCoverage);
router.post('/calculate', calculateAndSaveCoverage);

module.exports = router;
