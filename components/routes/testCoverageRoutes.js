import express from 'express';
import { getTestCoverage, calculateAndSaveCoverage, getCoverageById, annotateSourceCode } from '../controllers/testCoverageController.js';
import TestCoverage from '../models/testCoverageModel.js';
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

export default router;