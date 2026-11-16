const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  },
  name: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: 'application/pdf'
  },
  fileSize: {
    type: Number,
    default: 0
  },
  extractedText: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: String,
    default: 'Faculty Preceptor'
  }
});

const topicSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  unitId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  estimatedReadMinutes: {
    type: Number,
    default: 10
  },
  mcqCount: {
    type: Number,
    default: 5
  },
  hasReactions: {
    type: Boolean,
    default: false
  },
  clinicalPearls: [String],
  keyTakeaways: [String],
  contentMarkdown: {
    type: String,
    default: ''
  },
  documents: {
    type: [documentSchema],
    default: []
  },
  // Auto-translated fields for India's 9 primary languages (en, hi, bn, te, ta, mr, gu, kn, ml)
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({})
  }
});

const unitSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  orderIndex: {
    type: Number,
    default: 1
  },
  topics: [topicSchema],
  translations: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({})
  }
});

const subjectSchema = new mongoose.Schema(
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
    program: {
      type: String,
      default: 'Pharm.D'
    },
    yearName: {
      type: String,
      required: true,
      index: true // Supports instant Study Year filtering
    },
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    iconName: {
      type: String,
      default: 'Pill'
    },
    color: {
      type: String,
      default: '#006354'
    },
    description: {
      type: String,
      default: ''
    },
    units: [unitSchema],
    // Auto-translated fields for India's 9 primary languages (en, hi, bn, te, ta, mr, gu, kn, ml)
    translations: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subject', subjectSchema);
