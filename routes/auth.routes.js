const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pharmd_jwt_secret', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new Pharm.D user (Student, Teacher, Super Admin)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, collegeId, collegeName, department, degreeProgram, academicYear, batchName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'STUDENT',
      collegeId: collegeId || 'col-manipal',
      collegeName: collegeName || 'Manipal College of Pharmaceutical Sciences',
      department: department || 'Department of Pharmacy Practice',
      degreeProgram: degreeProgram || 'Pharm.D (Doctor of Pharmacy)',
      academicYear: academicYear || '4th Year (Clinical Clerkship)',
      batchName: batchName || 'Pharm.D Cohort 2022-28'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        collegeName: user.collegeName,
        department: user.department,
        degreeProgram: user.degreeProgram,
        academicYear: user.academicYear,
        batchName: user.batchName,
        streakDays: user.streakDays,
        xpPoints: user.xpPoints,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find by email or fallback to role if provided
    let user = await User.findOne({ email: email.toLowerCase() });
    
    // If not found by email, check if role matched a standard seed user
    if (!user && role) {
      user = await User.findOne({ role });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        collegeName: user.collegeName,
        department: user.department,
        degreeProgram: user.degreeProgram,
        academicYear: user.academicYear,
        batchName: user.batchName,
        streakDays: user.streakDays,
        xpPoints: user.xpPoints,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

