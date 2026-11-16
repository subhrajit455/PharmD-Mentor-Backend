require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const User = require('./models/User');
const College = require('./models/College');
const colleges = require('./data/colleges');
const Subject = require('./models/Subject');
const Reaction = require('./models/Reaction');
const Question = require('./models/Question');
const ClinicalCase = require('./models/ClinicalCase');
const AuditLog = require('./models/AuditLog');
const translatorService = require('./services/translator.service');

const seedDatabase = async () => {
  try {
    console.log('[Seed]: Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'pharmd_mentor',
      serverSelectionTimeoutMS: 15000
    });
    console.log('[Seed]: Successfully connected to database:', mongoose.connection.name);

    // 1. Clear previous collections
    console.log('[Seed]: Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Subject.deleteMany({}),
      Reaction.deleteMany({}),
      Question.deleteMany({}),
      ClinicalCase.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // 2. Seed Real Pharm.D Colleges
    console.log('[Seed]: Seeding Pharm.D Colleges...');
    await College.insertMany(colleges);

    // 3. Seed Real Pharm.D Users (Super Admin, Primary Demo Accounts, and Institutional Cadres)
    console.log('[Seed]: Seeding Pharm.D Users for Colleges...');
    const institutionalUsers = [
      {
        name: 'Dr. Rajeshwar Sen, Pharm.D, Ph.D',
        email: 'director@pharmdmentor.edu',
        password: 'Admin@PharmD2026',
        role: 'SUPER_ADMIN',
        collegeId: 'col-manipal',
        collegeName: 'Central PCI Pharm.D Directorate',
        department: 'Division of Clinical Pharmacy Governance',
        degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
        academicYear: 'Directorate Faculty',
        batchName: 'PCI National Faculty Cadre',
        streakDays: 45,
        xpPoints: 9800,
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Dr. Ananya Sharma, Pharm.D, BCPS',
        email: 'ananya.pharma@pharmd.edu',
        password: 'Faculty@PharmD2026',
        role: 'TEACHER',
        collegeId: 'col-jss',
        collegeName: 'JSS College of Pharmacy & Hospital, Mysuru',
        department: 'Department of Pharmacy Practice & Clinical Pharmacy',
        degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
        academicYear: 'Hospital Clinical Preceptor',
        batchName: 'Clinical Faculty Batch 2024',
        streakDays: 28,
        xpPoints: 6450,
        avatarUrl: ''
      },
      {
        name: 'Dr. Rohan Verma (Pharm.D Candidate)',
        email: 'rohan.v@student.pharmd.edu',
        password: 'Student@PharmD2026',
        role: 'STUDENT',
        collegeId: 'col-manipal',
        collegeName: 'Manipal College of Pharmaceutical Sciences',
        department: 'Department of Pharmacy Practice',
        degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
        academicYear: '4th Year (Clinical Clerkship)',
        batchName: 'Pharm.D Cohort 2022-28',
        streakDays: 14,
        xpPoints: 3420,
        avatarUrl: ''
      }
    ];

    // Seed Faculty & Student accounts for all 27 PCI-approved institutions
    colleges.forEach((c) => {
      const codeKey = c.code.toLowerCase().replace(/[^a-z0-9]/g, '');
      institutionalUsers.push({
        name: `Faculty Preceptor (${c.code})`,
        email: `faculty.${codeKey}@pharmdmentor.edu`,
        password: 'Faculty@PharmD2026',
        role: 'TEACHER',
        collegeId: c.collegeId,
        collegeName: c.name,
        department: 'Department of Pharmacy Practice & Clinical Pharmacy',
        degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
        academicYear: 'Clinical Faculty',
        batchName: `${c.code} Faculty Cadre`,
        streakDays: 25,
        xpPoints: 5400,
        avatarUrl: ''
      });

      institutionalUsers.push({
        name: `Pharm.D Candidate (${c.code})`,
        email: `student.${codeKey}@student.pharmd.edu`,
        password: 'Student@PharmD2026',
        role: 'STUDENT',
        collegeId: c.collegeId,
        collegeName: c.name,
        department: 'Department of Pharmacy Practice',
        degreeProgram: 'Pharm.D (Doctor of Pharmacy)',
        academicYear: '4th Year (Clinical Clerkship)',
        batchName: `${c.code} Cohort 2022-28`,
        streakDays: 12,
        xpPoints: 2800,
        avatarUrl: ''
      });
    });

    await User.create(institutionalUsers);

    // 4. Seed Real PCI Pharm.D Curriculum with 9 Indian Language Translations
    console.log('[Seed]: Generating Auto-Translations for India\'s 9 Primary Languages...');

    // Translations for Subjects
    const pharmaTrans = await translatorService.translateSubject({
      name: 'Pharmacology & Toxicology',
      description: 'Covers mechanisms of drug action, organ systems, and clinical toxicology protocols.'
    });

    const therapTrans = await translatorService.translateSubject({
      name: 'Pharmacotherapeutics & Clinical Pharmacy',
      description: 'Covers disease state management, guideline-directed pharmacotherapy, and ward case rounds.'
    });

    const biochemTrans = await translatorService.translateSubject({
      name: 'Pharmaceutical & Clinical Biochemistry',
      description: 'Covers metabolic bioenergetics, enzyme kinetics, and inborn errors of metabolism.'
    });

    const hospitalTrans = await translatorService.translateSubject({
      name: 'Clinical Pharmacokinetics & TDM',
      description: 'Covers therapeutic drug monitoring, AUC/MIC targets, and dosing adjustments in renal failure.'
    });

    // Translations for Topics
    const cholinergicTrans = await translatorService.translateTopic({
      title: 'Cholinergic Agonists & Organophosphate Poisoning Protocol',
      clinicalPearls: [
        'SLUDGE syndrome: Salivation, Lacrimation, Urination, Defecation, GI motility, Emesis.',
        'Pralidoxime (2-PAM) reactivates cholinesterase if administered before "aging" occurs.',
        'Atropine is the physiological antidote for muscarinic hyperactivation; titrate until pulmonary secretions are dry.'
      ],
      keyTakeaways: [
        'Acetylcholine acts on Nicotinic and Muscarinic receptors.',
        'Organophosphates irreversibly bind serine-OH of Acetylcholinesterase.',
        'Physostigmine crosses blood-brain barrier; Neostigmine does not.'
      ],
      contentMarkdown: 'Acetylcholinesterase inhibitors prevent enzymatic degradation of acetylcholine.'
    });

    const aceiTrans = await translatorService.translateTopic({
      title: 'ACE Inhibitors, ARBs & Hemodynamic Contraindications',
      clinicalPearls: [
        'Dry cough is caused by bradykinin accumulation (cleaved by ACE/kininase II).',
        'Absolute contraindication in bilateral renal artery stenosis (abrupt drop in GFR) and pregnancy.'
      ],
      keyTakeaways: [
        'Enalapril and Ramipril are prodrugs converted by esterases to active diacids.',
        'Reduce cardiac remodeling and mortality in HFrEF.'
      ],
      contentMarkdown: 'Angiotensin II maintains efferent arteriolar tone in bilateral renal artery stenosis.'
    });

    const hfrefTrans = await translatorService.translateTopic({
      title: 'Guideline-Directed Medical Therapy (GDMT) in Heart Failure (HFrEF)',
      clinicalPearls: [
        'The 4 pillars of HFrEF mortality reduction: ARNI, Beta-Blocker, MRA, and SGLT2i.',
        'Allow a 36-hour washout period when switching between ACE inhibitors and Sacubitril/Valsartan.'
      ],
      keyTakeaways: [
        'Sacubitril inhibits neprilysin, preventing degradation of BNP, ANP, and bradykinin.',
        'Target doses should be up-titrated based on renal function and blood pressure.'
      ],
      contentMarkdown: 'Guideline-Directed Medical Therapy significantly reduces hospitalizations in heart failure.'
    });

    const krebsTrans = await translatorService.translateTopic({
      title: 'TCA (Krebs) Cycle & Mitochondrial Bioenergetics',
      clinicalPearls: [
        'Fluoroacetate inhibits Aconitase, causing toxic fluorocitrate accumulation ("suicide inhibition").',
        'Succinate Dehydrogenase is the only enzyme bound to the inner mitochondrial membrane (Complex II).'
      ],
      keyTakeaways: [
        'Yield per turn: 3 NADH, 1 FADH2, 1 GTP (10 ATP equivalents).',
        'Isocitrate Dehydrogenase is the primary rate-limiting regulatory enzyme.'
      ],
      contentMarkdown: 'Central aerobic metabolic pathway oxidizing Acetyl-CoA to carbon dioxide.'
    });

    const vancoTrans = await translatorService.translateTopic({
      title: 'Vancomycin AUC/MIC Guided Dosing & Trough Monitoring',
      clinicalPearls: [
        'Target AUC24/MIC ratio of 400 to 600 for serious MRSA bacteremia.',
        'Trough levels > 15-20 mcg/mL carry elevated risk of nephrotoxicity.'
      ],
      keyTakeaways: [
        'Loading dose: 20-35 mg/kg based on actual body weight in critically ill patients.',
        'Draw trough serum concentration immediately prior to the 4th dose at steady state.'
      ],
      contentMarkdown: 'Vancomycin requires individualized dosing based on Cockcroft-Gault creatinine clearance.'
    });

    console.log('[Seed]: Seeding Pharm.D Subjects & Curriculum into Database...');
    await Subject.insertMany([
      {
        id: 'sub-pharma',
        collegeId: 'col-manipal',
        program: 'Pharm.D',
        yearName: '2nd Year Pharm.D',
        name: 'Pharmacology & Toxicology',
        code: 'PHARM-201',
        iconName: 'Pill',
        color: '#006354',
        translations: pharmaTrans,
        units: [
          {
            id: 'unit-ans',
            subjectId: 'sub-pharma',
            title: 'Autonomic Nervous System (ANS) & Clinical Toxicology',
            orderIndex: 1,
            topics: [
              {
                id: 'top-cholinergic',
                unitId: 'unit-ans',
                title: 'Cholinergic Agonists & Organophosphate Poisoning Protocol',
                estimatedReadMinutes: 12,
                mcqCount: 8,
                hasReactions: true,
                clinicalPearls: [
                  'SLUDGE syndrome: Salivation, Lacrimation, Urination, Defecation, GI motility, Emesis.',
                  'Pralidoxime (2-PAM) reactivates cholinesterase if administered before "aging" of the phosphorylated enzyme occurs.',
                  'Atropine is the physiological antidote for muscarinic hyperactivation; titrate until pulmonary secretions are dry.'
                ],
                keyTakeaways: [
                  'Acetylcholine acts on Nicotinic (ionotropic) and Muscarinic (GPCR) receptors.',
                  'Organophosphates irreversibly bind serine-OH at the active site of Acetylcholinesterase (AChE).',
                  'Physostigmine crosses blood-brain barrier (tertiary amine); Neostigmine does not (quaternary amine).'
                ],
                contentMarkdown: `### Mechanism of Action
Acetylcholinesterase inhibitors prevent the enzymatic breakdown of acetylcholine in the synaptic cleft, prolonging residence time and receptor activation.

#### Emergency Inpatient Management Protocol:
1. Decontamination (remove clothes, wash skin with cold water).
2. Establish airway & suction secretions.
3. High-dose IV Atropine (titrate 2-5 mg every 5-10 min until bronchospasm clears).
4. IV Pralidoxime within 12-24 hours before enzyme aging.`,
                translations: cholinergicTrans
              }
            ]
          },
          {
            id: 'unit-cvs',
            subjectId: 'sub-pharma',
            title: 'Cardiovascular & Renal Pharmacology',
            orderIndex: 2,
            topics: [
              {
                id: 'top-ace-inhibitors',
                unitId: 'unit-cvs',
                title: 'ACE Inhibitors, ARBs & Hemodynamic Contraindications',
                estimatedReadMinutes: 15,
                mcqCount: 10,
                hasReactions: true,
                clinicalPearls: [
                  'Dry cough is caused by bradykinin accumulation (normally cleaved by ACE/kininase II).',
                  'Absolute contraindication in bilateral renal artery stenosis (causes acute loss of GFR) and pregnancy.'
                ],
                keyTakeaways: [
                  'Enalapril and Ramipril are prodrugs converted by hepatic esterases to active diacids.',
                  'Reduce cardiac remodeling and mortality in HFrEF.'
                ],
                contentMarkdown: `### Renin-Angiotensin-Aldosterone Cascade
Angiotensinogen -> Angiotensin I (via Renin) -> Angiotensin II (via ACE). Blocking ACE reduces intraglomerular pressure by dilating efferent arterioles.`,
                translations: aceiTrans
              }
            ]
          }
        ]
      },
      {
        id: 'sub-therapeutics',
        collegeId: 'col-manipal',
        program: 'Pharm.D',
        yearName: '4th Year Pharm.D',
        name: 'Pharmacotherapeutics & Clinical Pharmacy',
        code: 'THERAP-401',
        iconName: 'Stethoscope',
        color: '#052c52',
        translations: therapTrans,
        units: [
          {
            id: 'unit-cardio-therap',
            subjectId: 'sub-therapeutics',
            title: 'Cardiovascular Pharmacotherapy & GDMT',
            orderIndex: 1,
            topics: [
              {
                id: 'top-hfref-gdmt',
                unitId: 'unit-cardio-therap',
                title: 'Guideline-Directed Medical Therapy (GDMT) in Heart Failure (HFrEF)',
                estimatedReadMinutes: 18,
                mcqCount: 10,
                hasReactions: true,
                clinicalPearls: [
                  'The 4 pillars of HFrEF mortality reduction: ARNI (Sacubitril/Valsartan), Beta-Blocker, MRA, and SGLT2i.',
                  'Allow a 36-hour washout period when switching between ACE inhibitors and Sacubitril/Valsartan.'
                ],
                keyTakeaways: [
                  'Sacubitril inhibits neprilysin, preventing degradation of BNP, ANP, and bradykinin.',
                  'Target doses should be up-titrated every 2-4 weeks based on renal function, BP, and serum potassium.'
                ],
                contentMarkdown: `### Evidence-Based Pharmacotherapy for HFrEF
Guideline-Directed Medical Therapy (GDMT) significantly reduces hospitalizations and all-cause cardiovascular death in patients with ejection fraction <= 40%.`,
                translations: hfrefTrans
              }
            ]
          }
        ]
      },
      {
        id: 'sub-biochem',
        collegeId: 'col-manipal',
        program: 'Pharm.D',
        yearName: '1st Year Pharm.D',
        name: 'Pharmaceutical & Clinical Biochemistry',
        code: 'BIOCHEM-101',
        iconName: 'FlaskConical',
        color: '#006354',
        translations: biochemTrans,
        units: [
          {
            id: 'unit-metabolism',
            subjectId: 'sub-biochem',
            title: 'Carbohydrate Metabolism & Clinical Disorders',
            orderIndex: 1,
            topics: [
              {
                id: 'top-krebs-cycle',
                unitId: 'unit-metabolism',
                title: 'TCA (Krebs) Cycle & Mitochondrial Bioenergetics',
                estimatedReadMinutes: 14,
                mcqCount: 9,
                hasReactions: true,
                clinicalPearls: [
                  'Fluoroacetate inhibits Aconitase, causing toxic fluorocitrate accumulation ("suicide inhibition").',
                  'Succinate Dehydrogenase is the only enzyme bound to the inner mitochondrial membrane (Complex II).'
                ],
                keyTakeaways: [
                  'Yield per turn: 3 NADH, 1 FADH2, 1 GTP (10 ATP equivalents).',
                  'Isocitrate Dehydrogenase is the primary rate-limiting regulatory enzyme, allosterically activated by ADP.'
                ],
                contentMarkdown: `### Amphibolic Nature of Krebs Cycle
Provides metabolic intermediates for gluconeogenesis (malate, oxaloacetate), heme synthesis (succinyl-CoA), and fatty acid synthesis (citrate).`,
                translations: krebsTrans
              }
            ]
          }
        ]
      },
      {
        id: 'sub-hospital',
        collegeId: 'col-manipal',
        program: 'Pharm.D',
        yearName: '5th Year Pharm.D',
        name: 'Clinical Pharmacokinetics & TDM',
        code: 'TDM-501',
        iconName: 'ShieldCheck',
        color: '#b45309',
        translations: hospitalTrans,
        units: [
          {
            id: 'unit-tdm-antimicrobials',
            subjectId: 'sub-hospital',
            title: 'Therapeutic Drug Monitoring (TDM) of Glycopeptides & Aminoglycosides',
            orderIndex: 1,
            topics: [
              {
                id: 'top-vancomycin-tdm',
                unitId: 'unit-tdm-antimicrobials',
                title: 'Vancomycin AUC/MIC Guided Dosing & Trough Monitoring',
                estimatedReadMinutes: 16,
                mcqCount: 8,
                hasReactions: false,
                clinicalPearls: [
                  'Current IDSA guidelines recommend AUC24/MIC ratio of 400 to 600 rather than solely relying on trough levels.',
                  'Trough levels > 15-20 mcg/mL carry elevated risk of nephrotoxicity.'
                ],
                keyTakeaways: [
                  'Loading dose: 20-35 mg/kg based on actual body weight for critically ill patients.',
                  'Draw trough serum concentration immediately prior to the 4th dose at steady state.'
                ],
                contentMarkdown: `### Clinical Pharmacokinetic Protocol
Vancomycin requires individualized dosing tailored to renal clearance (Cockcroft-Gault CrCl equation).`,
                translations: vancoTrans
              }
            ]
          }
        ]
      }
    ]);

    // 5. Seed Reactions
    console.log('[Seed]: Seeding Reactions...');
    await Reaction.insertMany([
      {
        id: 'rxn-krebs',
        collegeId: 'col-manipal',
        topicId: 'top-krebs-cycle',
        title: 'The Tricarboxylic Acid (Krebs) Cycle Cascade',
        category: 'BIOCHEMICAL_CYCLE',
        description: 'Central metabolic pathway in the mitochondrial matrix oxidizing Acetyl-CoA to CO2 and electron carriers.',
        clinicalSignificance: 'Arsenite and Mercury block alpha-ketoglutarate dehydrogenase by binding lipoic acid cofactors.',
        steps: [
          {
            stepNumber: 1,
            title: 'Citrate Condensation',
            substrate: 'Oxaloacetate (4C) + Acetyl-CoA (2C)',
            reagents: 'H2O',
            catalystsOrEnzymes: 'Citrate Synthase',
            cofactors: 'CoA-SH released',
            product: 'Citrate (6C)',
            mechanismNote: 'Nucleophilic addition of methyl carbon of acetyl-CoA to carbonyl of oxaloacetate.'
          },
          {
            stepNumber: 2,
            title: 'Isomerization via Cis-Aconitate',
            substrate: 'Citrate (6C)',
            reagents: 'Fe2+ (Iron-sulfur center)',
            catalystsOrEnzymes: 'Aconitase',
            cofactors: 'Reversible dehydration/hydration',
            product: 'D-Isocitrate (6C)',
            mechanismNote: 'Inhibited irreversibly by Fluoroacetate (suicide inhibition to fluorocitrate).'
          }
        ]
      },
      {
        id: 'rxn-paracetamol',
        collegeId: 'col-manipal',
        topicId: 'top-cholinergic',
        title: 'Industrial Synthesis & Bioactivation of Acetaminophen',
        category: 'ORGANIC_SYNTHESIS',
        description: 'Industrial acetylation of 4-aminophenol to N-(4-hydroxyphenyl)acetamide and subsequent hepatic CYP450 metabolism.',
        clinicalSignificance: 'CYP2E1 oxidizes acetaminophen into hepatotoxic NAPQI when glutathione is exhausted.',
        steps: [
          {
            stepNumber: 1,
            title: 'Electrophilic Acetylation',
            substrate: '4-Aminophenol (p-aminophenol)',
            reagents: 'Acetic Anhydride (CH3CO)2O',
            catalystsOrEnzymes: 'Glacial Acetic Acid (Reflux at 115°C)',
            cofactors: 'Byproduct: Acetic Acid',
            product: 'Paracetamol (Acetaminophen)',
            mechanismNote: 'Nucleophilic attack by the amino nitrogen onto the carbonyl carbon of acetic anhydride.'
          }
        ]
      }
    ]);

    // 6. Seed Questions
    console.log('[Seed]: Seeding Questions...');
    await Question.insertMany([
      {
        id: 'q-ras-acei',
        collegeId: 'col-manipal',
        subjectId: 'sub-pharma',
        topicId: 'top-ace-inhibitors',
        subjectName: 'Pharmacology & Therapeutics',
        topicTitle: 'ACE Inhibitors in Renal Vascular Disease',
        type: 'CLINICAL_VIGNETTE',
        prompt: 'Which antihypertensive class is strictly contraindicated in patients with bilateral renal artery stenosis?',
        clinicalVignette: 'A 64-year-old male with severe peripheral vascular disease and bilateral renal artery stenosis is evaluated for uncontrolled hypertension.',
        options: [
          { id: 'A', text: 'ACE Inhibitors / ARBs', note: 'Efferent arteriolar dilation causes abrupt drop in GFR' },
          { id: 'B', text: 'Calcium Channel Blockers', note: 'Safe; exerts preferential afferent arteriolar dilation' },
          { id: 'C', text: 'Thiazide Diuretics', note: 'Not strictly contraindicated; monitor volume' },
          { id: 'D', text: 'Beta-1 Selective Blockers', note: 'Cardioselective, safe in renal vascular disease' }
        ],
        correctOptionId: 'A',
        rationale: 'In bilateral renal artery stenosis (RAS), GFR is critically maintained by angiotensin II-mediated efferent arteriolar vasoconstriction. Blocking angiotensin II with ACE inhibitors or ARBs produces immediate efferent vasodilation, precipitating acute renal failure.',
        referenceCitation: 'Goodman & Gilman: The Pharmacological Basis of Therapeutics, 14th Ed., Ch. 26',
        difficulty: 'MEDIUM',
        highYieldTag: 'Pharm.D Clinical Core & Board Examination',
        isDailyFeatured: true,
        pearlBengali: 'ক্লিনিক্যাল পয়েন্ট: বাইল্যাটেরাল রেনাল আর্টারি স্টেনোসিস থাকলে ACEI বা ARB দিলে ইফারেন্ট আর্টেরিওলার ডাইলেশন হয়ে একিউট কিডনি ফেইলিউর হতে পারে।',
        pearlHindi: 'क्लिनिकल टिप: द्विपक्षीय गुर्दे की धमनी स्टेनोसिस (Bilateral RAS) में ACE इनहिबिटर का उपयोग सख्त वर्जित है क्योंकि यह अचानक GFR गिराकर किडनी फेल कर सकता है।'
      }
    ]);

    // 7. Seed Clinical Inpatient Cases
    console.log('[Seed]: Seeding Clinical Cases...');
    await ClinicalCase.create({
      caseId: 'case-cardio-bed12',
      title: 'Decompensated Heart Failure with Preserved Renal Perfusion (HFrEF NYHA III)',
      ward: 'Cardiology Inpatient Ward',
      bedNumber: 'Bed 12',
      patientProfile: {
        age: 68,
        gender: 'Male',
        weight: '78 kg',
        chiefComplaint: 'Bilateral pedal edema, orthopnea, and worsening dyspnea on exertion.',
        historyOfPresentIllness: 'Known history of ischemic cardiomyopathy (LVEF 32%). Now presents with JVP elevation and 3+ pitting edema.',
        allergies: ['Sulfonamides (rash)'],
        pastMedicalHistory: ['Hypertension', 'Type 2 Diabetes Mellitus', 'CAD s/p PCI (2020)']
      },
      vitals: {
        bp: '148/92 mmHg',
        hr: '94 bpm',
        rr: '24 /min',
        spO2: '93%',
        temperature: '36.8°C'
      },
      labValues: [
        { testName: 'Serum Creatinine', value: '1.4 mg/dL', referenceRange: '0.7 - 1.2 mg/dL', isAbnormal: true },
        { testName: 'eGFR', value: '52 mL/min', referenceRange: '> 60 mL/min', isAbnormal: true },
        { testName: 'Serum Potassium', value: '4.6 mEq/L', referenceRange: '3.5 - 5.0 mEq/L', isAbnormal: false }
      ],
      medications: [
        { drugName: 'Furosemide', dose: '40 mg', route: 'IV', frequency: 'BID', indication: 'Decongestion', status: 'ACTIVE' },
        { drugName: 'Sacubitril / Valsartan', dose: '24/26 mg', route: 'PO', frequency: 'BID', indication: 'HFrEF GDMT', status: 'HOLD_TILL_DRY' }
      ],
      drugRelatedProblems: [
        {
          category: 'Drug Selection & Timing',
          description: 'ARNI initiation while acutely congested requires careful titration.',
          recommendation: 'Achieve euvolemia with IV Furosemide prior to aggressive up-titration of Sacubitril/Valsartan.',
          severity: 'MODERATE'
        }
      ],
      preceptorNotes: 'Patient responding well to loop diuresis.'
    });

    // 8. Seed Audit Logs
    console.log('[Seed]: Seeding Audit Logs...');
    await AuditLog.insertMany([
      {
        user: 'Dr. Ananya Sharma (Teacher)',
        action: 'Verified Clinical Vignette: Organophosphate Toxicology Protocol',
        role: 'TEACHER',
        ip: '103.21.14.82',
        details: 'Approved for Pharm.D 2nd Year Question Studio'
      },
      {
        user: 'Dr. Rajeshwar Sen (Super Admin)',
        action: 'Enforced PCI Pharm.D 6-Year Master Blueprint Sync with 9 Indian Language Auto-Translations',
        role: 'SUPER_ADMIN',
        ip: '182.74.52.19',
        details: 'Languages: EN, HI, BN, TE, TA, MR, GU, KN, ML'
      }
    ]);

    console.log('------------------------------------------------------------------');
    console.log('[Seed]: DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('[Seed]: Database: MongoDB Atlas (pharmd_mentor)');
    console.log('[Seed]: 100% Pharm.D Content with Auto-Translations in 9 Indian Languages:');
    console.log('        EN (English), HI (Hindi), BN (Bengali), TE (Telugu), TA (Tamil),');
    console.log('        MR (Marathi), GU (Gujarati), KN (Kannada), ML (Malayalam)');
    console.log('------------------------------------------------------------------');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
