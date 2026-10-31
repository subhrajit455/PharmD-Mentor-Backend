const mongoose = require('mongoose');

const reactionStepSchema = new mongoose.Schema({
  stepNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  substrate: {
    type: String,
    required: true
  },
  reagents: {
    type: String,
    default: ''
  },
  catalystsOrEnzymes: {
    type: String,
    default: ''
  },
  cofactors: {
    type: String,
    default: ''
  },
  product: {
    type: String,
    required: true
  },
  mechanismNote: {
    type: String,
    default: ''
  }
});

const reactionSchema = new mongoose.Schema(
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
    topicId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['BIOCHEMICAL_CYCLE', 'ORGANIC_SYNTHESIS', 'DRUG_METABOLISM', 'CLINICAL_PATHWAY'],
      default: 'BIOCHEMICAL_CYCLE'
    },
    description: {
      type: String,
      default: ''
    },
    clinicalSignificance: {
      type: String,
      default: ''
    },
    steps: [reactionStepSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Reaction', reactionSchema);

