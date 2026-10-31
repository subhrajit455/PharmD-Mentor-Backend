const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// @route   GET /api/questions
// @desc    Get questions filtered by topic, subject, or type
router.get('/', async (req, res) => {
  try {
    const { topicId, subjectId, type, difficulty, limit } = req.query;
    const filter = {};
    if (topicId) filter.topicId = topicId;
    if (subjectId) filter.subjectId = subjectId;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    let query = Question.find(filter).sort({ createdAt: 1 });
    if (limit) query = query.limit(Number(limit));

    const questions = await query.exec();
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/questions/daily
// @desc    Get daily featured clinical vignette MCQ
router.get('/daily', async (req, res) => {
  try {
    let dailyQ = await Question.findOne({ isDailyFeatured: true });
    if (!dailyQ) {
      dailyQ = await Question.findOne({ type: 'CLINICAL_VIGNETTE' }) || await Question.findOne();
    }
    res.json({ success: true, question: dailyQ });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/questions
// @desc    Add a new question to the bank
router.post('/', async (req, res) => {
  try {
    const questionId = req.body.id || `q-${Date.now()}`;
    const newQuestion = await Question.create({
      ...req.body,
      id: questionId
    });
    res.status(201).json({ success: true, question: newQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

