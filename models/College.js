const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    collegeId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    region: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    programs: {
      type: [String],
      default: ['PHARM_D']
    },
    seatQuota: {
      maxTeachers: { type: Number, default: 50 },
      maxStudents: { type: Number, default: 600 },
      usedTeachers: { type: Number, default: 0 },
      usedStudents: { type: Number, default: 0 }
    },
    validUntil: {
      type: String,
      default: '2028-12-31'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('College', collegeSchema);

