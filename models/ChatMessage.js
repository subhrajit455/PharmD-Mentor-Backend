const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      default: null,
      index: true
    },
    userRole: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'COLLEGE_ADMIN', 'SUPER_ADMIN', 'GUEST'],
      default: 'STUDENT'
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        'general',
        'interaction',
        'renal',
        'moa',
        'soap',
        'naranjo',
        'toxicology',
        'curriculum',
        'quiz'
      ],
      default: 'general'
    },
    language: {
      type: String,
      default: 'en'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
