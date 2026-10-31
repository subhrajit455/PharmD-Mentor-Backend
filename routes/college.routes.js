const express = require('express');
const router = express.Router();
const College = require('../models/College');

// @route   GET /api/colleges
// @desc    Get all registered Pharm.D colleges
router.get('/', async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    // Transform to match frontend schema
    const formatted = colleges.map((c) => ({
      id: c.collegeId || c._id,
      name: c.name,
      code: c.code,
      slug: c.slug,
      status: c.status,
      programs: c.programs,
      seatQuota: c.seatQuota,
      validUntil: c.validUntil
    }));
    res.json({ success: true, count: colleges.length, colleges: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/colleges
// @desc    Onboard a new Pharm.D institution
router.post('/', async (req, res) => {
  try {
    const { name, code, slug, maxTeachers, maxStudents } = req.body;
    const collegeId = `col-${Date.now()}`;
    const newCollege = await College.create({
      collegeId,
      name,
      code,
      slug: slug || code.toLowerCase(),
      status: 'ACTIVE',
      programs: ['PHARM_D'],
      seatQuota: {
        maxTeachers: Number(maxTeachers) || 50,
        maxStudents: Number(maxStudents) || 600,
        usedTeachers: 1,
        usedStudents: 0
      },
      validUntil: '2028-12-31'
    });

    res.status(201).json({
      success: true,
      college: {
        id: newCollege.collegeId,
        name: newCollege.name,
        code: newCollege.code,
        slug: newCollege.slug,
        status: newCollege.status,
        programs: newCollege.programs,
        seatQuota: newCollege.seatQuota,
        validUntil: newCollege.validUntil
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/colleges/:id/status
// @desc    Toggle college status between ACTIVE and SUSPENDED
router.patch('/:id/status', async (req, res) => {
  try {
    const college = await College.findOne({
      $or: [{ collegeId: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found' });
    }

    college.status = college.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await college.save();

    res.json({ success: true, college });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

