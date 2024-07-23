const express = require('express');
const { analyzeComplexity, getResults } = require('../controllers/complexityController');
const { getHighComplexModules } = require('../controllers/com');
const { getComplexityById } = require('../controllers/com');

const router = express.Router();

router.post('/analyze', analyzeComplexity);
router.get('/results', getResults);
router.get('/highComplexModules', getHighComplexModules); 
router.get('/:id', getComplexityById);  // Correct route for getting complexity by ID

module.exports = router;
