const express = require('express');
const { analyzeComplexity, getResults } = require('../controllers/complexityController');

const router = express.Router();

router.post('/analyze', analyzeComplexity);
router.get('/results', getResults);

module.exports = router;
