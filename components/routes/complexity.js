const express = require('express');
const router = express.Router();
const ComplexityController = require('../controllers/complexityController');

router.post('/calculate', ComplexityController.calculateAndSaveComplexity);
router.get('/results', ComplexityController.getComplexityResults); // Ensure this matches the URL

module.exports = router;
