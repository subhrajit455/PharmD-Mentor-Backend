const mongoose = require('mongoose');

const questionOptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  }
});

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    collegeId: {
      type: String,
      default: 'col-manipal'
    },
    subjectId: {
      type: String,
      required: true
    },
    topicId: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      required: true
    },
    topicTitle: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['CLINICAL_VIGNETTE', 'SINGLE_BEST_ANSWER', 'RAPID_FIRE'],
      default: 'SINGLE_BEST_ANSWER'
    },
    prompt: {
      type: String,
      required: true
    },
    clinicalVignette: {
      type: String,
      default: ''
    },
    options: [questionOptionSchema],
    correctOptionId: {
      type: String,
      required: true
    },
    rationale: {
      type: String,
      required: true
    },
    referenceCitation: {
      type: String,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM'
    },
    highYieldTag: {
      type: String,
      default: 'Pharm.D Clinical High Yield'
    },
    isDailyFeatured: {
      type: Boolean,
      default: false
    },
    pearlBengali: {
      type: String,
      default: ''
    },
    pearlHindi: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);

