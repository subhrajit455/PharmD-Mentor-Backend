const express = require('express');
const router = express.Router();
const ClinicalCase = require('../models/ClinicalCase');

// @route   GET /api/cases
// @desc    Get all clinical cases and inpatient profiles
router.get('/', async (req, res) => {
  try {
    const cases = await ClinicalCase.find().sort({ createdAt: -1 });
    res.json({ success: true, count: cases.length, cases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/cases/:id
// @desc    Get clinical case by ID
router.get('/:id', async (req, res) => {
  try {
    const singleCase = await ClinicalCase.findOne({ caseId: req.params.id });
    if (!singleCase) {
      return res.status(404).json({ success: false, message: 'Clinical case not found' });
    }
    res.json({ success: true, case: singleCase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cases
// @desc    Create a new ward case
router.post('/', async (req, res) => {
  try {
    const caseId = req.body.caseId || `case-${Date.now()}`;
    const newCase = await ClinicalCase.create({
      ...req.body,
      caseId
    });
    res.status(201).json({ success: true, case: newCase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

