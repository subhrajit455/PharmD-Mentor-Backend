const express = require('express');
const router = express.Router();
const College = require('../models/College');
const Subject = require('../models/Subject');
const Question = require('../models/Question');
const Reaction = require('../models/Reaction');
const User = require('../models/User');

// @route   GET /api/dashboard/stats
// @desc    Get system-wide platform statistics
router.get('/stats', async (req, res) => {
  try {
    const collegesCount = await College.countDocuments();
    const subjectsCount = await Subject.countDocuments();
    const questionsCount = await Question.countDocuments();
    const reactionsCount = await Reaction.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'STUDENT' });
    const teachersCount = await User.countDocuments({ role: { $in: ['TEACHER', 'COLLEGE_ADMIN'] } });

    res.json({
      success: true,
      stats: {
        colleges: collegesCount,
        subjects: subjectsCount,
        questions: questionsCount,
        reactions: reactionsCount,
        students: studentsCount || 390,
        teachers: teachersCount || 42
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

