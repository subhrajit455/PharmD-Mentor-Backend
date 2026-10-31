const express = require('express');
const router = express.Router();
const Reaction = require('../models/Reaction');

// @route   GET /api/reactions
// @desc    Get all biochemical pathways and drug reactions
router.get('/', async (req, res) => {
  try {
    const { topicId, category } = req.query;
    const filter = {};
    if (topicId) filter.topicId = topicId;
    if (category) filter.category = category;

    const reactions = await Reaction.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, count: reactions.length, reactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/reactions/:id
// @desc    Get reaction by ID
router.get('/:id', async (req, res) => {
  try {
    const reaction = await Reaction.findOne({ id: req.params.id });
    if (!reaction) {
      return res.status(404).json({ success: false, message: 'Reaction pathway not found' });
    }
    res.json({ success: true, reaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/reactions
// @desc    Create a new reaction pathway
router.post('/', async (req, res) => {
  try {
    const reactionId = req.body.id || `rxn-${Date.now()}`;
    const newReaction = await Reaction.create({
      ...req.body,
      id: reactionId
    });
    res.status(201).json({ success: true, reaction: newReaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

