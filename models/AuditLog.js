const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'STUDENT'
    },
    ip: {
      type: String,
      default: '127.0.0.1'
    },
    details: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

