const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'],
      default: 'STUDENT'
    },
    collegeId: {
      type: String,
      default: 'col-manipal'
    },
    collegeName: {
      type: String,
      default: 'Manipal College of Pharmaceutical Sciences'
    },
    department: {
      type: String,
      default: 'Department of Pharmacy Practice'
    },
    degreeProgram: {
      type: String,
      default: 'Pharm.D (Doctor of Pharmacy)'
    },
    academicYear: {
      type: String,
      default: '4th Year (Clinical Clerkship)'
    },
    batchName: {
      type: String,
      default: 'Pharm.D Cohort 2022-28'
    },
    streakDays: {
      type: Number,
      default: 14
    },
    xpPoints: {
      type: Number,
      default: 3420
    },
    avatarUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Password comparison helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
