const mongoose = require('mongoose');

const clinicalCaseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true
    },
    ward: {
      type: String,
      default: 'Cardiology Inpatient Ward'
    },
    bedNumber: {
      type: String,
      default: 'Bed 12'
    },
    patientProfile: {
      age: Number,
      gender: String,
      weight: String,
      height: String,
      bsa: String,
      chiefComplaint: String,
      historyOfPresentIllness: String,
      allergies: [String],
      pastMedicalHistory: [String]
    },
    vitals: {
      bp: String,
      hr: String,
      rr: String,
      spO2: String,
      temperature: String
    },
    labValues: [
      {
        testName: String,
        value: String,
        referenceRange: String,
        isAbnormal: Boolean
      }
    ],
    medications: [
      {
        drugName: String,
        dose: String,
        route: String,
        frequency: String,
        indication: String,
        status: String
      }
    ],
    drugRelatedProblems: [
      {
        category: String,
        description: String,
        recommendation: String,
        severity: String
      }
    ],
    preceptorNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ClinicalCase', clinicalCaseSchema);

