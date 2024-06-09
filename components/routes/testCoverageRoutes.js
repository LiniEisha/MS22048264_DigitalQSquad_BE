// routes/testCoverageRoutes.js
const express = require('express');
const { getTestCoverage } = require('../controllers/testCoverageController');

const router = express.Router();

router.get('/', getTestCoverage);

module.exports = router;
