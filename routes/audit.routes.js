const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// @route   GET /api/audit-logs
// @desc    Get audit trail records
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/audit-logs
// @desc    Record a new audit log entry
router.post('/', async (req, res) => {
  try {
    const { user, action, role, details } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const log = await AuditLog.create({
      user,
      action,
      role: role || 'STUDENT',
      ip: String(ip),
      details: details || ''
    });
    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

