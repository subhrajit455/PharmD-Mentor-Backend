require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const colleges = require('./data/colleges');
const College = require('./models/College');
const User = require('./models/User');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  console.warn('[Seed]: DNS configuration note:', error.message);
}

const seedCollegesAndUsers = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required to seed colleges');
  }

  console.log('[Seed]: Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || 'pharmd_mentor',
    serverSelectionTimeoutMS: 20000
  });
  console.log(`[Seed]: Connected to database: ${mongoose.connection.name}`);

  // 1. Bulk upsert all 27 PCI Pharm.D colleges
  const collegeOps = colleges.map((college) => ({
    updateOne: {
      filter: { collegeId: college.collegeId },
      update: {
        $set: {
          name: college.name,
          code: college.code,
          slug: college.slug,
          region: college.region,
          state: college.state,
          programs: college.programs,
          validUntil: college.validUntil
        },
        $setOnInsert: {
          collegeId: college.collegeId,
          status: college.status,
          seatQuota: college.seatQuota
        }
      },
      upsert: true
    }
  }));

  await College.bulkWrite(collegeOps);
  console.log(`[Seed]: Successfully upserted ${colleges.length} Pharm.D colleges.`);

  // 2. Pre-hash credentials for fast bulk user provisioning
  console.log('[Seed]: Generating secure password hashes for institutional cadres...');
  const [adminHash, facultyHash, studentHash] = await Promise.all([
    bcrypt.hash('Admin@PharmD2026', 10),
    bcrypt.hash('Faculty@PharmD2026', 10),
    bcrypt.hash('Student@PharmD2026', 10)
  ]);

  const userOps = [
    {
      updateOne: {
        filter: { email: 'director@pharmdmentor.edu' },
        update: {
          $set: {
            name: 'Dr. Rajeshwar Sen, Pharm.D, Ph.D',
            email: 'director@pharmdmentor.edu',
            password: adminHash,
            role: 'SUPER_ADMIN',
            collegeId: 'col-manipal',
            collegeName: 'Central PCI Pharm.D Directorate',
            department: 'Division of Clinical Pharmacy Governance',
            degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
            academicYear: 'Directorate Faculty',
            batchName: 'PCI National Faculty Cadre',
            streakDays: 45,
            xpPoints: 9800
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { email: 'ananya.pharma@pharmd.edu' },
        update: {
          $set: {
            name: 'Dr. Ananya Sharma, Pharm.D, BCPS',
            email: 'ananya.pharma@pharmd.edu',
            password: facultyHash,
            role: 'TEACHER',
            collegeId: 'col-jss',
            collegeName: 'JSS College of Pharmacy & Hospital, Mysuru',
            department: 'Department of Pharmacy Practice & Clinical Pharmacy',
            degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
            academicYear: 'Hospital Clinical Preceptor',
            batchName: 'Clinical Faculty Batch 2024',
            streakDays: 28,
            xpPoints: 6450
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { email: 'rohan.v@student.pharmd.edu' },
        update: {
          $set: {
            name: 'Dr. Rohan Verma (Pharm.D Candidate)',
            email: 'rohan.v@student.pharmd.edu',
            password: studentHash,
            role: 'STUDENT',
            collegeId: 'col-manipal',
            collegeName: 'Manipal College of Pharmaceutical Sciences',
            department: 'Department of Pharmacy Practice',
            degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
            academicYear: '4th Year (Clinical Clerkship)',
            batchName: 'Pharm.D Cohort 2022-28',
            streakDays: 14,
            xpPoints: 3420
          }
        },
        upsert: true
      }
    }
  ];

  // Provision Faculty & Student logins for each of the 27 colleges
  for (const c of colleges) {
    const codeKey = c.code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const facultyEmail = `faculty.${codeKey}@pharmdmentor.edu`;
    const studentEmail = `student.${codeKey}@student.pharmd.edu`;

    userOps.push({
      updateOne: {
        filter: { email: facultyEmail },
        update: {
          $set: {
            name: `Faculty Preceptor (${c.code})`,
            email: facultyEmail,
            password: facultyHash,
            role: 'TEACHER',
            collegeId: c.collegeId,
            collegeName: c.name,
            department: 'Department of Pharmacy Practice & Clinical Pharmacy',
            degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
            academicYear: 'Clinical Faculty',
            batchName: `${c.code} Faculty Cadre`,
            streakDays: 25,
            xpPoints: 5400
          }
        },
        upsert: true
      }
    });

    userOps.push({
      updateOne: {
        filter: { email: studentEmail },
        update: {
          $set: {
            name: `Pharm.D Candidate (${c.code})`,
            email: studentEmail,
            password: studentHash,
            role: 'STUDENT',
            collegeId: c.collegeId,
            collegeName: c.name,
            department: 'Department of Pharmacy Practice',
            degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
            academicYear: '4th Year (Clinical Clerkship)',
            batchName: `${c.code} Cohort 2022-28`,
            streakDays: 12,
            xpPoints: 2800
          }
        },
        upsert: true
      }
    });
  }

  await User.bulkWrite(userOps);
  const totalUsers = await User.countDocuments();
  console.log(`[Seed]: Successfully upserted ${userOps.length} institutional users. Total users in database: ${totalUsers}`);
};

seedCollegesAndUsers()
  .catch((error) => {
    console.error('[Seed]: Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
