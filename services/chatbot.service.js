const https = require('https');
const { translateText } = require('./translator.service');

/**
 * PharmD Mentor AI - Clinical Pharmacy Knowledge & Intelligence Engine
 * Designed specifically for Doctor of Pharmacy (Pharm.D) students, interns, hospital preceptors, and faculty.
 */

// 1. Structured Drug Interaction Database
const DRUG_INTERACTIONS = [
  {
    drugs: ['warfarin', 'nsaid', 'ibuprofen', 'naproxen', 'diclofenac'],
    severity: 'Major / High Risk',
    mechanism: 'Pharmacodynamic synergism: NSAIDs inhibit platelet COX-1 and induce GI mucosal ulceration, compounded by Warfarin vitamin K antagonism.',
    clinicalEffect: 'Markedly increased risk of severe gastrointestinal hemorrhage, prolonged INR instability, and fatal internal bleeding.',
    recommendation: 'Avoid concomitant combination. Use Acetaminophen (Paracetamol) ≤ 2g/day for mild-to-moderate analgesia. If NSAID cannot be avoided, add strong PPI gastroprotection (e.g., Pantoprazole 40mg daily) and monitor INR within 3 days.',
    monitoring: 'INR at baseline and 48-72h, stool occult blood, hemoglobin/hematocrit, signs of bruising or melena.'
  },
  {
    drugs: ['clopidogrel', 'omeprazole'],
    severity: 'Major',
    mechanism: 'Competitive inhibition of hepatic CYP2C19 by Omeprazole prevents biotransformation of Clopidogrel (prodrug) into its active thiol metabolite.',
    clinicalEffect: 'Significantly decreased antiplatelet platelet inhibition; heightened rate of stent thrombosis and recurrent myocardial infarction.',
    recommendation: 'Switch Omeprazole to Pantoprazole or Rabeprazole, which exert significantly less CYP2C19 inhibition, or use an H2RA (Famotidine) if gastroprotection is required.',
    monitoring: 'Signs of recurrent ischemia, platelet reactivity testing (P2Y12 assay) in high-risk PCI cases.'
  },
  {
    drugs: ['methotrexate', 'amoxicillin', 'penicillin', 'piperacillin'],
    severity: 'Major / Fatal Toxicity Potential',
    mechanism: 'Penicillins competitively inhibit renal organic anion transporters (OAT1/OAT3) responsible for renal tubular excretion of Methotrexate.',
    clinicalEffect: 'Severely elevated serum Methotrexate levels leading to bone marrow suppression, leukopenia, thrombocytopenia, mucositis, and acute kidney injury.',
    recommendation: 'Avoid combination especially with oncologic or high-dose MTX. In low-dose rheumatoid arthritis MTX, closely monitor CBC and serum creatinine or choose non-penicillin antimicrobial (e.g., Macrolide/Cephalosporin with caution).',
    monitoring: 'Serum Methotrexate concentrations, CBC with differential, Renal Function Tests (BUN/SCr).'
  },
  {
    drugs: ['simvastatin', 'clarithromycin', 'erythromycin'],
    severity: 'Contraindicated / Severe',
    mechanism: 'Potent mechanism-based inhibition of CYP3A4 by macrolides dramatically escalates systemic exposure of Simvastatin lactone.',
    clinicalEffect: 'Marked rhabdomyolysis risk, severe myopathy, acute renal failure secondary to myoglobinuria.',
    recommendation: 'Contraindicated. Suspend Simvastatin therapy during the course of Clarithromycin, or use Azithromycin (no significant CYP3A4 inhibition), or switch to Rosuvastatin/Pravastatin (non-CYP3A4 metabolized).',
    monitoring: 'Creatine Kinase (CK), unexplained muscle pain/tenderness, dark/tea-colored urine.'
  },
  {
    drugs: ['ace inhibitor', 'lisinopril', 'ramipril', 'enalapril', 'spironolactone', 'eplerenone', 'potassium'],
    severity: 'Major',
    mechanism: 'Additive suppression of aldosterone production and decreased potassium excretion in the distal nephron collecting tubules.',
    clinicalEffect: 'Severe hyperkalemia (K+ > 5.5-6.5 mEq/L) predisposing to fatal cardiac dysrhythmias, peaked T-waves, sine waves, and cardiac arrest.',
    recommendation: 'Start Spironolactone at low dose (12.5-25mg daily). Check baseline serum potassium and creatinine before initiation. Recheck at 1 week, 4 weeks, and quarterly. Discontinue potassium supplements and salt substitutes.',
    monitoring: 'Serum Potassium, BUN, SCr, baseline ECG if K+ > 5.5 mEq/L.'
  },
  {
    drugs: ['ssri', 'fluoxetine', 'sertraline', 'escitalopram', 'tramadol', 'linezolid'],
    severity: 'Major / Life-Threatening',
    mechanism: 'Synergistic intrasynaptic accumulation of serotonin due to 5-HT reuptake inhibition plus Tramadol 5-HT reuptake inhibition or Linezolid non-selective MAO inhibition.',
    clinicalEffect: 'Serotonin Syndrome (Hunter Criteria): neuromuscular excitability (clonus, hyperreflexia), autonomic instability (hyperthermia, tachycardia), and altered mental status.',
    recommendation: 'Avoid concurrent use. Discontinue serotonergic agents at least 2 weeks (5 weeks for Fluoxetine) prior to Linezolid. For Tramadol, consider alternative opioid without serotonergic activity (e.g., Morphine, Oxycodone).',
    monitoring: 'Temperature, clonus, tremor, diaphoresis, blood pressure variability.'
  },
  {
    drugs: ['digoxin', 'amiodarone', 'verapamil', 'clarithromycin'],
    severity: 'Major',
    mechanism: 'Inhibition of renal P-glycoprotein (P-gp) efflux pump and reduced non-renal clearance of Digoxin.',
    clinicalEffect: 'Digoxin toxicity: nausea, vomiting, yellow-green halos (xanthopsia), sinus bradycardia, AV block, and life-threatening ventricular arrhythmias.',
    recommendation: 'Reduce Digoxin maintenance dose by 50% immediately upon initiating Amiodarone, Verapamil, or Clarithromycin. Obtain trough serum Digoxin level 7-10 days after co-administration.',
    monitoring: 'Serum Digoxin level (target 0.5-0.9 ng/mL for heart failure), heart rate, serum potassium and magnesium.'
  },
  {
    drugs: ['lithium', 'nsaid', 'ibuprofen', 'hydrochlorothiazide', 'thiazide', 'ace inhibitor'],
    severity: 'Major',
    mechanism: 'NSAIDs reduce renal prostaglandins leading to decreased GFR; Thiazides deplete sodium in the proximal tubule, triggering compensatory proximal lithium reabsorption.',
    clinicalEffect: 'Lithium toxicity: coarse tremors, ataxia, slurred speech, confusion, seizures, acute tubular necrosis.',
    recommendation: 'Avoid NSAIDs; use Acetaminophen. If Thiazides or ACE inhibitors are initiated, reduce Lithium dose by 50% and monitor levels closely.',
    monitoring: 'Serum Lithium level (target 0.6-1.0 mEq/L), sodium, BUN, SCr.'
  },
  {
    drugs: ['fluoroquinolone', 'ciprofloxacin', 'levofloxacin', 'antacid', 'calcium', 'iron', 'magnesium', 'sucralfate'],
    severity: 'Moderate to Major',
    mechanism: 'Chelation of polyvalent cations (Al3+, Mg2+, Ca2+, Fe2+) forming insoluble drug complexes that cannot cross gastrointestinal epithelium.',
    clinicalEffect: 'Up to 70-90% reduction in antibiotic bioavailability leading to clinical treatment failure and emergence of bacterial resistance.',
    recommendation: 'Space administration: administer Fluoroquinolones at least 2 hours before or 4-6 hours after cation-containing antacids, supplements, or dairy products.',
    monitoring: 'Clinical resolution of infection (temperature curve, WBC count, CRP).'
  }
];

// 2. High-Yield Mechanisms of Action (MOA) Knowledge Base
const MOA_DATABASE = {
  'sglt2 inhibitors': {
    class: 'Sodium-Glucose Co-Transporter 2 Inhibitors (Empagliflozin, Dapagliflozin, Canagliflozin)',
    moa: 'Inhibits SGLT2 transporters in the early segment (S1/S2) of the renal proximal convoluted tubule. This suppresses glucose and sodium reabsorption, causing glucosuria (caloric wasting) and natriuresis.',
    clinicalPearls: 'Restores tubuloglomerular feedback by increasing sodium delivery to the macula densa, leading to afferent arteriolar constriction and reduction of intraglomerular hypertension. Demonstrates class-effect reduction in HFrEF/HFpEF hospitalizations and CKD progression regardless of diabetic status.',
    monitoring: 'eGFR (temporary dip is hemodynamic, not toxic), euglycemic DKA signs, genital mycotic infections, blood pressure, volume status.'
  },
  'glp-1 receptor agonists': {
    class: 'Incretin Mimetics (Semaglutide, Liraglutide, Dulaglutide, Tirzepatide)',
    moa: 'Selectively binds and activates the G-protein coupled GLP-1 receptor on pancreatic beta-cells, amplifying glucose-dependent insulin secretion, suppressing inappropriate glucagon secretion from alpha-cells, delaying gastric emptying, and stimulating hypothalamic POMC neurons to promote satiety.',
    clinicalPearls: 'Glucose-dependent insulin release imparts very low intrinsic risk of hypoglycemia when used as monotherapy. Significant reduction in MACE (Major Adverse Cardiovascular Events) and superior body weight reduction.',
    monitoring: 'GI tolerability (nausea, vomiting), pancreatitis symptoms, thyroid C-cell tumor history (contraindicated in MEN2/MTC), gallbladder disease.'
  },
  'doac': {
    class: 'Direct Oral Anticoagulants (Apixaban, Rivaroxaban, Edoxaban, Dabigatran)',
    moa: 'Apixaban, Rivaroxaban, and Edoxaban directly, reversibly, and competitively bind to the active catalytic site of Factor Xa (both free and clot-bound), preventing the conversion of prothrombin (II) to thrombin (IIa). Dabigatran directly inhibits free and clot-bound Thrombin (IIa).',
    clinicalPearls: 'Predictable pharmacokinetics eliminate the need for routine INR coagulation monitoring. Apixaban requires dose reduction (to 2.5mg BID) only if patient meets ≥ 2 criteria: Age ≥ 80, Weight ≤ 60kg, SCr ≥ 1.5 mg/dL. Reversal agents: Idarucizumab (for Dabigatran), Andexanet alfa (for Factor Xa inhibitors).',
    monitoring: 'Renal function (CrCl), hemoglobin/hematocrit, bleeding risk (HAS-BLED).'
  },
  'ace inhibitors': {
    class: 'Angiotensin-Converting Enzyme Inhibitors (Ramipril, Enalapril, Lisinopril)',
    moa: 'Competitive inhibition of zinc-metallopeptidase ACE (kininase II), blocking conversion of Angiotensin I to Angiotensin II (a potent vasoconstrictor and aldosterone stimulator). Concurrently inhibits the degradation of Bradykinin, substance P, and enkephalins.',
    clinicalPearls: 'Bradykinin accumulation accounts for both class-effect beneficial vasodilation and typical adverse effects (dry nocturnal cough in 10-15%, and life-threatening angioedema). Dilates the efferent arteriole in nephrons, reducing intraglomerular pressure and halting diabetic albuminuria.',
    monitoring: 'Serum Potassium (risk of hyperkalemia), SCr/BUN (accept up to 30% rise in SCr within first 2 weeks), blood pressure.'
  },
  'beta blockers': {
    class: 'Beta-Adrenoceptor Antagonists (Metoprolol Succinate, Carvedilol, Bisoprolol)',
    moa: 'Competitively blocks beta-1 adrenergic receptors in the myocardium, reducing adenylyl cyclase activation, intracellular cAMP, and protein kinase A-mediated calcium influx. Decreases chronotropy (heart rate), inotropy (contractility), dromotropy (conduction velocity), and renal renin release.',
    clinicalPearls: 'Only three beta-blockers demonstrate mortality benefit in HFrEF: Carvedilol (non-selective beta + alpha-1 blocker), Metoprolol Succinate extended-release, and Bisoprolol. Must be initiated at micro-doses and uptitrated slowly in stable, euvolemic heart failure.',
    monitoring: 'Resting Heart Rate (target 55-65 bpm), BP, signs of fluid overload or worsening decompensation, PR interval on ECG.'
  },
  'statins': {
    class: 'HMG-CoA Reductase Inhibitors (Atorvastatin, Rosuvastatin)',
    moa: 'Structural analogues of 3-hydroxy-3-methylglutaryl-coenzyme A that competitively inhibit HMG-CoA reductase, the rate-limiting enzyme in de novo hepatic cholesterol synthesis. Hepatic intracellular cholesterol depletion triggers SREBP-2 transcription and upregulation of cell-surface LDL receptors, clearing ApoB-containing LDL particles from circulation.',
    clinicalPearls: 'Exhibit critical "pleiotropic" effects independent of LDL reduction: plaque stabilization via fibrous cap thickening, reduction of matrix metalloproteinases, restoration of endothelial nitric oxide synthase (eNOS), and suppression of systemic vascular inflammation (hs-CRP).',
    monitoring: 'Baseline LFTs, lipid profile at 4-12 weeks, Creatine Kinase (CK) only if patient reports muscle ache or dark urine.'
  }
};

// 3. Emergency Antidotes & Toxicology Knowledge Base
const ANTIDOTE_DATABASE = [
  {
    toxin: 'Paracetamol (Acetaminophen)',
    antidote: 'N-Acetylcysteine (NAC)',
    regimen: 'Replenishes hepatic glutathione reserves and acts as a direct glutathione surrogate to detoxify toxic metabolite NAPQI. IV Acetadote: 150 mg/kg over 1h, then 50 mg/kg over 4h, then 100 mg/kg over 16h (21-hour protocol) guided by the Rumack-Matthew Nomogram.'
  },
  {
    toxin: 'Opioids (Morphine, Fentanyl, Heroin, Methadone)',
    antidote: 'Naloxone',
    regimen: 'Pure competitive opioid receptor antagonist (mu, kappa, delta). 0.04 to 0.4 mg IV/IM/IN, titrated to restore spontaneous respiration without triggering severe acute withdrawal crisis. Short half-life (~60 min) may require repeated doses or continuous IV infusion for long-acting opioids.'
  },
  {
    toxin: 'Heparin (Unfractionated)',
    antidote: 'Protamine Sulfate',
    regimen: 'Positively charged polycationic peptide that forms a stable, electrostatically neutral salt with highly acidic, negatively charged Heparin. 1 mg neutralizes approximately 100 USP units of Heparin remaining in the patient (max single dose 50 mg). Administer slow IV push to avoid severe hypotension.'
  },
  {
    toxin: 'Warfarin',
    antidote: 'Vitamin K1 (Phytonadione) & 4-Factor PCC (Kcentra)',
    regimen: 'For major life-threatening bleeding: 4-Factor Prothrombin Complex Concentrate (PCC) 25-50 units/kg IV plus Vitamin K1 5-10 mg slow IV infusion over 30 min. Fresh Frozen Plasma (FFP) if PCC is unavailable.'
  },
  {
    toxin: 'Digoxin',
    antidote: 'Digoxin Immune Fab (DigiFab)',
    regimen: 'Purified Fab antibody fragments binding free serum Digoxin with 1000-fold higher affinity than Na+/K+ ATPase. Dosage based on ingested mg: Vials = [Digoxin ingested (mg) * 0.8] / 0.5, or empiric 10-20 vials for unknown acute ingestion cardiac arrest.'
  },
  {
    toxin: 'Organophosphates & Carbamates (Insecticides)',
    antidote: 'Atropine Sulfate & Pralidoxime (2-PAM)',
    regimen: 'Atropine: 2 to 4 mg IV every 5-10 min until complete tracheobronchial atropinization (clear chest auscultation, HR > 80, dry secretions). Pralidoxime (2-PAM): 1-2 g IV over 30 min to reactivate phosphorylated acetylcholinesterase before irreversible "aging" occurs.'
  },
  {
    toxin: 'Beta Blockers',
    antidote: 'Glucagon, High-Dose Insulin Euglycemia (HIE), Calcium Gluconate',
    regimen: 'Glucagon 3-10 mg slow IV push stimulates Gs protein bypassing beta-1 receptors to elevate myocardial cAMP. High-dose insulin (1 unit/kg bolus followed by 0.5-1 unit/kg/h infusion with 10% dextrose) provides critical myocardial fuel substrate.'
  },
  {
    toxin: 'Benzodiazepines (Diazepam, Alprazolam, Midazolam)',
    antidote: 'Flumazenil',
    regimen: 'Competitive GABA-A receptor benzodiazepine binding site antagonist. 0.2 mg IV over 30 seconds; repeat 0.3-0.5 mg up to 3 mg. CAUTION: Contraindicated in chronic benzodiazepine users or co-ingestion of pro-convulsant tricyclic antidepressants due to fatal refractory seizure risk.'
  }
];

// 4. Cockcroft-Gault CrCl Calculator
function calculateCrCl({ age, weight, scr, gender }) {
  const ageNum = parseFloat(age);
  const wtNum = parseFloat(weight);
  const scrNum = parseFloat(scr);
  const isFemale = gender && (gender.toLowerCase().startsWith('f') || gender.toLowerCase().includes('woman'));

  if (isNaN(ageNum) || isNaN(wtNum) || isNaN(scrNum) || scrNum <= 0) {
    return null;
  }

  // Cockcroft-Gault Equation
  let crcl = ((140 - ageNum) * wtNum) / (72 * scrNum);
  if (isFemale) {
    crcl *= 0.85;
  }
  crcl = Math.round(crcl * 10) / 10;

  let ckdStage = '';
  let dosingPearls = [];

  if (crcl >= 90) {
    ckdStage = 'Stage 1 (Normal or High GFR, CrCl ≥ 90 mL/min)';
    dosingPearls.push('Standard full dosing for most renal-cleared antimicrobials.');
  } else if (crcl >= 60) {
    ckdStage = 'Stage 2 (Mildly Decreased, CrCl 60-89 mL/min)';
    dosingPearls.push('Monitor narrow therapeutic index drugs (Digoxin, Aminoglycosides, Vancomycin).');
  } else if (crcl >= 30) {
    ckdStage = 'Stage 3 (Moderately Decreased, CrCl 30-59 mL/min)';
    dosingPearls.push('Piperacillin/Tazobactam: Reduce to 2.25g - 3.375g q6h.');
    dosingPearls.push('Enoxaparin: Standard dosing safe down to 30 mL/min, then monitor anti-Xa.');
    dosingPearls.push('Ciprofloxacin: Reduce dose by 50% or prolong interval to q18-24h.');
  } else if (crcl >= 15) {
    ckdStage = 'Stage 4 (Severely Decreased, CrCl 15-29 mL/min)';
    dosingPearls.push('Enoxaparin: Reduce therapeutic treatment to 1 mg/kg once daily (from 1 mg/kg BID).');
    dosingPearls.push('Meropenem: Reduce to 500mg q12h.');
    dosingPearls.push('Apixaban: Dose reduce or monitor if co-criteria met.');
    dosingPearls.push('Metformin: Discontinue or contraindicated if eGFR < 30 mL/min due to lactic acidosis risk.');
  } else {
    ckdStage = 'Stage 5 (Kidney Failure / ESRD, CrCl < 15 mL/min)';
    dosingPearls.push('Hemodialysis dosing schedules required post-dialysis.');
    dosingPearls.push('Avoid nephrotoxic NSAIDs, Aminoglycosides, and IV radiocontrast.');
  }

  return {
    crcl,
    ckdStage,
    dosingPearls,
    formula: `CrCl = [(140 - ${ageNum}) × ${wtNum} kg] / (72 × ${scrNum} mg/dL)${isFemale ? ' × 0.85 (Female)' : ''}`
  };
}

// 5. Naranjo ADR Algorithm Evaluator
function evaluateNaranjo(score) {
  let category = '';
  let interpretation = '';

  if (score >= 9) {
    category = 'Definite ADR (Score ≥ 9)';
    interpretation = 'The reaction followed a reasonable temporal sequence, confirmed by dechallenge, rechallenge, and objective laboratory verification without alternate clinical etiologies.';
  } else if (score >= 5) {
    category = 'Probable ADR (Score 5-8)';
    interpretation = 'The reaction followed a reasonable temporal sequence, resolved on dechallenge or confirmed by known clinical pharmacological profile, and is unlikely related to underlying disease.';
  } else if (score >= 1) {
    category = 'Possible ADR (Score 1-4)';
    interpretation = 'The reaction followed a temporal sequence but could also be explained by the patient’s clinical disease or other concurrent drug therapy.';
  } else {
    category = 'Doubtful ADR (Score ≤ 0)';
    interpretation = 'The reaction is unlikely drug-related; another disease etiology is much more probable.';
  }

  return { score, category, interpretation };
}

// 6. Clinical SOAP Note Generator
function generateSoapTemplate(condition = 'Acute Decompensated Heart Failure') {
  return `### 📋 Clinical Pharmacist SOAP Note
**Patient Setting:** Inpatient Hospital Ward Round
**Primary Diagnosis:** ${condition}

#### 1. S (Subjective)
- **Chief Complaint:** Progressive dyspnea on exertion, orthopnea (3 pillows), bilateral lower extremity swelling for 4 days.
- **History of Present Illness (HPI):** 68-year-old male with known HFrEF (LVEF 30%), ischemic cardiomyopathy, and T2DM presents with acute symptom worsening after dietary sodium indiscretion.
- **Review of Systems:** Denies chest pain, palpitations, syncope, or fever.
- **Medication Adherence:** Reports skipping diuretics during weekend travel.

#### 2. O (Objective)
- **Vital Signs:** BP 148/92 mmHg | HR 88 bpm regular | RR 24 /min | SpO2 91% on room air (96% on 2L nasal cannula) | Temp 98.4°F
- **Physical Examination:** JVD 7 cm above sternal angle, positive hepatojugular reflux, bilateral bibasilar inspiratory crackles, 2+ pitting pedal edema bilaterally.
- **Laboratory Data:**
  - BNP: 1,420 pg/mL (elevated) | Troponin I: Negative (< 0.02 ng/mL)
  - Sodium: 136 mEq/L | Potassium: 4.4 mEq/L
  - Serum Creatinine: 1.3 mg/dL (baseline 1.1) | BUN: 28 mg/dL | eGFR: 54 mL/min
- **Current Medications:** Furosemide 40mg PO daily, Sacubitril/Valsartan 49/51mg PO BID, Carvedilol 12.5mg PO BID, Empagliflozin 10mg PO daily.

#### 3. A (Assessment - Drug Therapy Problems)
- **Problem 1 (Fluid Overload):** Decompensated congestive state requiring conversion from oral to intravenous loop diuretic due to gastrointestinal wall edema impairing oral bioavailability.
- **Problem 2 (Guideline-Directed Medical Therapy - GDMT):** Currently on 4 foundational neurohormonal pillars (ARNI + BB + MRA candidate + SGLT2i). Spironolactone (MRA) not yet initiated.
- **Problem 3 (Temporary Hemodynamic Stress):** Serum Creatinine slightly elevated (+0.2 mg/dL) representing transient cardiorenal congestion.

#### 4. P (Plan & Recommendations)
- **Immediate Pharmacotherapy:**
  1. Switch to IV Furosemide 80 mg IV bolus stat (double home oral dose in IV form), then 40 mg IV q12h.
  2. Continue Sacubitril/Valsartan 49/51mg BID and Empagliflozin 10mg daily as BP and renal function permit.
  3. Maintain Carvedilol 12.5mg BID (do not abruptly discontinue during mild-moderate decompensation unless cardiogenic shock or profound bradycardia ensues).
- **Clinical Monitoring Goals:**
  - Daily strict intake/output (target net negative 1.5 - 2.0 L/24h).
  - Daily morning weight before breakfast on identical scale.
  - Monitor RFT (BUN, SCr) and Serum Electrolytes (K+, Na+, Mg2+) q24h during aggressive diuresis.
- **Patient Counseling:** Sodium restriction (< 2 g/day), fluid restriction (1.5-2.0 L/day), and daily weight log instruction.`;
}

/**
 * Main AI Chat Processor
 * 1. Checks for Gemini API Key in environment
 * 2. If present, calls Gemini 2.5 Flash / 1.5 Flash
 * 3. If absent or network fails, uses the comprehensive Clinical Engine
 */
async function processChatMessage({ message, conversationId, category = 'general', language = 'en', history = [] }) {
  const query = (message || '').trim();
  const lowerQuery = query.toLowerCase();

  // Check if Gemini API is available
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const geminiResponse = await callGeminiApi(query, history, apiKey);
      if (geminiResponse) {
        let finalResponse = geminiResponse;
        if (language && language !== 'en') {
          try {
            finalResponse = await translateText(geminiResponse, language);
          } catch (tErr) {
            console.warn('Translation warning for Gemini response:', tErr.message);
          }
        }
        return {
          content: finalResponse,
          modelUsed: 'gemini-2.5-flash',
          category: category || detectCategory(lowerQuery),
          suggestions: generateSuggestions(lowerQuery)
        };
      }
    } catch (apiError) {
      console.warn('[Gemini API Call]: Fallback to internal clinical engine:', apiError.message);
    }
  }

  // Built-in Pharm.D Clinical Pharmacy Intelligence Engine
  let responseText = '';
  let detectedCategory = category;

  // 1. Check for CrCl calculation
  const hasCrclKeywords = lowerQuery.includes('crcl') || lowerQuery.includes('cockcroft') || lowerQuery.includes('creatinine clearance') || lowerQuery.includes('renal dose') || lowerQuery.includes('gfr');
  const ageMatch = query.match(/(\d{1,3})\s*(?:years?|y\/o|yo|age)/i) || query.match(/age\s*[:=]?\s*(\d{1,3})/i);
  const wtMatch = query.match(/(\d{2,3})\s*(?:kg|kilos?)/i) || query.match(/weight\s*[:=]?\s*(\d{2,3})/i);
  const scrMatch = query.match(/(?:scr|creatinine|serum creatinine)\s*[:=]?\s*(\d+(?:\.\d+)?)/i) || query.match(/(\d+\.\d+)\s*(?:mg\/dl)/i);
  const isFemale = lowerQuery.includes('female') || lowerQuery.includes('woman') || lowerQuery.includes('girl');

  if (hasCrclKeywords && (ageMatch || wtMatch || scrMatch)) {
    detectedCategory = 'renal';
    const ageVal = ageMatch ? ageMatch[1] : 65;
    const wtVal = wtMatch ? wtMatch[1] : 70;
    const scrVal = scrMatch ? scrMatch[1] : 1.2;
    const result = calculateCrCl({ age: ageVal, weight: wtVal, scr: scrVal, gender: isFemale ? 'female' : 'male' });

    if (result) {
      responseText = `### 🧪 Cockcroft-Gault Creatinine Clearance (CrCl) Analysis

- **Estimated CrCl:** **${result.crcl} mL/min**
- **Renal Function Staging:** ${result.ckdStage}
- **Formula Used:** \`${result.formula}\`

#### 📋 Antimicrobial & High-Alert Dosing Guidance:
${result.dosingPearls.map((p) => `- ${p}`).join('\n')}

> **Clinical Pharmacist Pearl:** In elderly patients with low muscle mass, a serum creatinine < 0.8 mg/dL may falsely overestimate CrCl. Consider utilizing 24-hour urine collection or Cystatin C if precise dosing of narrow-therapeutic-index drugs is essential.`;
    }
  }

  // 2. Check for Drug Interactions
  if (!responseText) {
    const matchedInteraction = DRUG_INTERACTIONS.find((item) => {
      let matches = 0;
      item.drugs.forEach((d) => {
        if (lowerQuery.includes(d)) matches++;
      });
      return matches >= 2;
    });

    if (matchedInteraction) {
      detectedCategory = 'interaction';
      responseText = `### 💊 Clinical Drug-Drug Interaction Alert

- **Severity Level:** **${matchedInteraction.severity}**
- **Pharmacological Mechanism:**
  ${matchedInteraction.mechanism}

- **Clinical Manifestation & Patient Outcome:**
  ${matchedInteraction.clinicalEffect}

- **Preceptor Recommended Action:**
  ${matchedInteraction.recommendation}

- **Key Monitoring Parameters:**
  ${matchedInteraction.monitoring}`;
    }
  }

  // 3. Check for MOA queries
  if (!responseText) {
    for (const [key, val] of Object.entries(MOA_DATABASE)) {
      if (lowerQuery.includes(key) || key.split(' ').some((word) => lowerQuery.includes(word) && word.length > 4)) {
        detectedCategory = 'moa';
        responseText = `### 🧬 Mechanism of Action: ${val.class}

#### Cellular & Biochemical Pharmacology
${val.moa}

#### 💡 High-Yield Clinical Pearls for Ward Rounds
${val.clinicalPearls}

#### 🔍 Monitoring & Safety Parameters
${val.monitoring}`;
        break;
      }
    }
  }

  // 4. Check for Emergency Antidotes / Toxicology
  if (!responseText && (lowerQuery.includes('antidote') || lowerQuery.includes('poison') || lowerQuery.includes('overdose') || lowerQuery.includes('toxicity') || lowerQuery.includes('toxicology'))) {
    detectedCategory = 'toxicology';
    const foundAntidote = ANTIDOTE_DATABASE.find((a) => lowerQuery.includes(a.toxin.toLowerCase()) || lowerQuery.includes(a.antidote.toLowerCase().split(' ')[0]));

    if (foundAntidote) {
      responseText = `### 🩺 Emergency Toxicology & Antidote Protocol
**Toxic Agent:** ${foundAntidote.toxin}  
**Primary Antidote:** **${foundAntidote.antidote}**

#### Administration & Clinical Protocol
${foundAntidote.regimen}

> **Critical Ward Precaution:** Secure airway, breathing, and circulation (ABCs) immediately. Contact the National Poisons Information Centre (NPIC) for complex multi-substance ingestions.`;
    } else {
      responseText = `### 🩺 High-Yield Clinical Antidote Quick Reference
Here are the essential emergency toxicology antidotes required for Pharm.D hospital clerkship:

| Toxic Ingestion | Primary Antidote | Core Mechanism |
| :--- | :--- | :--- |
| **Paracetamol (APAP)** | **N-Acetylcysteine (NAC)** | Replenishes hepatic glutathione to clear NAPQI |
| **Opioids (Morphine/Fentanyl)** | **Naloxone** | Competitive mu-opioid receptor antagonist |
| **Warfarin** | **Vitamin K1 & 4F-PCC** | Bypasses inhibition; supplies active factors II, VII, IX, X |
| **Heparin (UFH)** | **Protamine Sulfate** | Cationic salt neutralization of acidic heparin |
| **Digoxin** | **DigiFab (Immune Fab)** | Antibody fragment sequestering free digoxin |
| **Organophosphates** | **Atropine + Pralidoxime** | Reverses muscarinic excess & regenerates AChE |
| **Beta Blockers** | **High-Dose Glucagon / Insulin** | Stimulates myocardial cAMP bypassing beta-1 receptors |
| **Benzodiazepines** | **Flumazenil** | Competitive antagonist at GABA-A receptor |

*Type any specific poison name to get exact hospital titration schedules.*`;
    }
  }

  // 5. Check for SOAP Note requests
  if (!responseText && (lowerQuery.includes('soap') || lowerQuery.includes('case note') || lowerQuery.includes('case presentation') || lowerQuery.includes('ward round'))) {
    detectedCategory = 'soap';
    let targetCondition = 'Acute Decompensated Heart Failure (HFrEF)';
    if (lowerQuery.includes('copd')) targetCondition = 'Acute Exacerbation of COPD (AECOPD)';
    if (lowerQuery.includes('diabet') || lowerQuery.includes('dka')) targetCondition = 'Diabetic Ketoacidosis (DKA)';
    if (lowerQuery.includes('pneumonia') || lowerQuery.includes('cap')) targetCondition = 'Community-Acquired Pneumonia (CAP - CURB-65)';
    if (lowerQuery.includes('aki') || lowerQuery.includes('kidney')) targetCondition = 'Drug-Induced Acute Kidney Injury (AKI)';

    responseText = generateSoapTemplate(targetCondition);
  }

  // 6. Check for Naranjo ADR algorithm
  if (!responseText && (lowerQuery.includes('naranjo') || lowerQuery.includes('adr scale') || lowerQuery.includes('adverse drug reaction') || lowerQuery.includes('causality'))) {
    detectedCategory = 'naranjo';
    const scoreMatch = query.match(/(?:score|total)\s*[:=]?\s*(\d{1,2})/i);
    const scoreVal = scoreMatch ? parseInt(scoreMatch[1], 10) : 6;
    const evaluation = evaluateNaranjo(scoreVal);

    responseText = `### ⚠️ Naranjo ADR Probability Scale (Pharmacovigilance)

- **Calculated Causality Score:** **${evaluation.score}**
- **Assessment Category:** **${evaluation.category}**
- **Clinical Interpretation:** ${evaluation.interpretation}

#### 📋 The 10 Validated Naranjo Questions:
1. Are there previous conclusive reports on this reaction? *(+1 / 0 / 0)*
2. Did the adverse event appear after the suspect drug was administered? *(+2 / -1 / 0)*
3. Did the adverse reaction improve when the drug was discontinued? *(+1 / 0 / 0)*
4. Did the reaction reappear when the drug was readministered (rechallenge)? *(+2 / -1 / 0)*
5. Are there alternative causes that could on their own have caused the reaction? *(-1 / +2 / 0)*
6. Did the reaction reappear when a placebo was given? *(-1 / +1 / 0)*
7. Was the drug detected in the blood in concentrations known to be toxic? *(+1 / 0 / 0)*
8. Was the reaction more severe when the dose was increased, or less severe when decreased? *(+1 / 0 / 0)*
9. Did the patient have a similar reaction to the same or similar drugs in any previous exposure? *(+1 / 0 / 0)*
10. Was the adverse event confirmed by any objective evidence? *(+1 / 0 / 0)*

> **Preceptor Tip:** Document the suspected ADR on the official **PvPI (Pharmacovigilance Programme of India) Suspected ADR Reporting Form** with patient demographics, onset date, and batch number.`;
  }

  // 7. Check for PCI Curriculum or Subject inquiries
  if (!responseText && (lowerQuery.includes('syllabus') || lowerQuery.includes('pci') || lowerQuery.includes('curriculum') || lowerQuery.includes('subject') || lowerQuery.includes('year'))) {
    detectedCategory = 'curriculum';
    responseText = `### 📚 PCI 6-Year Doctor of Pharmacy (Pharm.D) Framework

The Pharmacy Council of India (PCI) national framework comprises 5 years of academic instruction and 1 full year of hospital clerkship & internship:

- **1st Year Pharm.D:** Human Anatomy & Physiology, Pharmaceutics, Medicinal Biochemistry, Pharmaceutical Organic Chemistry, Pharmaceutical Inorganic Chemistry, Remedial Mathematics/Biology.
- **2nd Year Pharm.D:** Pathophysiology, Pharmaceutical Microbiology, Pharmacognosy & Phytopharmaceuticals, Pharmacology-I, Community Pharmacy, Pharmacotherapeutics-I.
- **3rd Year Pharm.D:** Pharmacology-II, Pharmaceutical Analysis, Pharmacotherapeutics-II, Pharmaceutical Jurisprudence, Medicinal Chemistry, Pharmaceutical Formulations.
- **4th Year Pharm.D:** Pharmacotherapeutics-III, Hospital Pharmacy, Clinical Pharmacy, Biostatistics & Research Methodology, Biopharmaceutics & Pharmacokinetics, Clinical Toxicology.
- **5th Year Pharm.D:** Clinical Research, Pharmacoepidemiology & Pharmacoeconomics, Clinical Pharmacokinetics & Pharmacotherapeutic Drug Monitoring (TDM), Clerkship, Project Work.
- **6th Year Pharm.D:** 12-Month Inpatient Hospital Internship (General Medicine, Surgery, Pediatrics, Gynecology, ICU/Emergency).

*Need details on a specific subject, textbook citations, or clinical competencies? Just ask!*`;
  }

  // 8. General Clinical Assistant Fallback
  if (!responseText) {
    responseText = `### 🩺 PharmD Mentor Clinical Guidance

Regarding **"${query}"**:

In clinical pharmacy practice, evidence-based medication therapy management requires evaluating:
1. **Therapeutic Indication:** Aligning choice of drug with current clinical practice guidelines (e.g., ACC/AHA, KDIGO, ADA, GOLD, GINA).
2. **Pharmacokinetic Profile:** Half-life ($t_{1/2}$), route of elimination, hepatic CYP450 metabolism, and renal clearance.
3. **Safety & Drug Interactions:** Screening for narrow-therapeutic-index toxicities, electrolyte shifts, and contraindicated combinations.
4. **Patient-Specific Adjustments:** Age, estimated CrCl, liver function, pregnancy/lactation category, and clinical comorbidities.

> **Suggested Next Steps:** You can use the **Chatbot Menu** above to check drug interactions, calculate renal CrCl, generate a hospital ward SOAP note, or test your reflexes with a clinical viva quiz!`;
  }

  // Handle translation if target language is not English
  if (language && language !== 'en') {
    try {
      responseText = await translateText(responseText, language);
    } catch (err) {
      console.warn('Failed to translate response, returning English:', err.message);
    }
  }

  return {
    content: responseText,
    modelUsed: 'PharmD Clinical Engine v2.6',
    category: detectedCategory,
    suggestions: generateSuggestions(lowerQuery)
  };
}

/**
 * Call upstream Google Gemini API with Doctor of Pharmacy system instructions
 */
function callGeminiApi(userPrompt, conversationHistory, apiKey) {
  return new Promise((resolve, reject) => {
    const systemInstruction = `You are PharmD Mentor AI, a world-class Doctor of Pharmacy (Pharm.D) Clinical Pharmacist, Academic Preceptor, and Professor of Clinical Pharmacy.
You assist pharmacy students, interns, hospital residents, and preceptors with:
1. Evidence-based Pharmacology, Pharmacotherapy, and Molecular Mechanisms of Action (MOA).
2. Clinical Drug-Drug Interactions (CYP450 enzymes, P-gp, pharmacodynamic synergism, severity, monitoring).
3. Renal Dose Adjustments (Cockcroft-Gault CrCl calculation, KDIGO CKD guidelines).
4. Inpatient Ward Round SOAP Notes (Subjective, Objective, Assessment of Drug Therapy Problems, Plan with monitoring goals).
5. Pharmacovigilance & Adverse Drug Reaction Causality (Naranjo Algorithm, WHO-UMC criteria).
6. Clinical Toxicology, Poisoning, and Emergency Antidotes.
7. Pharmacy Council of India (PCI) 6-Year Pharm.D Syllabus & Competencies.

Always format your responses with structured Markdown: use bold headers, bullet lists, clinical pearl callouts, warning banners for high-alert drugs, and clear dosage tables. Maintain high academic rigor with clinical practicality.`;

    const contents = [];

    // Include recent conversation history for multi-turn context
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach((h) => {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    const payload = JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        topP: 0.95
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 12000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            resolve(json.candidates[0].content.parts[0].text);
          } else if (json.error) {
            reject(new Error(json.error.message || 'Gemini API Error'));
          } else {
            reject(new Error('Unexpected Gemini API response structure'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out'));
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

/**
 * Returns structured Chatbot Menu data for frontend dynamic rendering
 */
function getChatbotMenu() {
  return {
    title: 'PharmD Mentor Clinical AI Menu',
    subtitle: 'High-yield tools, calculators, and clinical workflows for ward rounds and academic study',
    categories: [
      {
        id: 'interaction',
        title: 'Drug Interaction Checker',
        icon: 'Pill',
        color: '#006354',
        bg: '#edf7f4',
        badge: 'Critical Safety',
        description: 'Screen combinations for CYP450, P-gp, and pharmacodynamic toxicities with preceptor recommendations.',
        presetPrompts: [
          'Check interaction: Warfarin and Ibuprofen',
          'Check interaction: Clopidogrel and Omeprazole',
          'Check interaction: Simvastatin and Clarithromycin',
          'Check interaction: Ramipril and Spironolactone'
        ]
      },
      {
        id: 'renal',
        title: 'Renal CrCl & Dosing Calculator',
        icon: 'FlaskConical',
        color: '#2563eb',
        bg: '#eff6ff',
        badge: 'Cockcroft-Gault',
        description: 'Calculate creatinine clearance and receive antimicrobials, anticoagulants, and DOAC adjustments.',
        presetPrompts: [
          'Calculate CrCl: Age 68, Weight 70kg, SCr 1.8 mg/dL, Male',
          'Calculate CrCl: Age 75, Weight 55kg, SCr 1.4 mg/dL, Female',
          'Renal dose adjustment for Piperacillin-Tazobactam when CrCl < 30',
          'Meropenem dosage guidelines in renal impairment'
        ]
      },
      {
        id: 'moa',
        title: 'Mechanism of Action (MOA)',
        icon: 'Dna',
        color: '#7c3aed',
        bg: '#f5f3ff',
        badge: 'Pharmacology',
        description: 'Deep-dive molecular targets, receptor pathways, and cellular cascades with clinical pearls.',
        presetPrompts: [
          'Explain Mechanism of Action of SGLT2 Inhibitors',
          'Explain Mechanism of Action of GLP-1 Receptor Agonists',
          'Explain Mechanism of Action of DOACs (Direct Oral Anticoagulants)',
          'Explain Mechanism of Action of ACE Inhibitors and Bradykinin role'
        ]
      },
      {
        id: 'soap',
        title: 'SOAP Note & Case Workup',
        icon: 'FileText',
        color: '#052c52',
        bg: '#ebf1f9',
        badge: 'Ward Rounds',
        description: 'Generate structured Subjective, Objective, Assessment (DTPs), and Plan notes for hospital cases.',
        presetPrompts: [
          'Generate SOAP note for Acute Decompensated Heart Failure',
          'Generate SOAP note for Acute Exacerbation of COPD',
          'Generate SOAP note for Community Acquired Pneumonia',
          'Generate SOAP note for Diabetic Ketoacidosis'
        ]
      },
      {
        id: 'toxicology',
        title: 'Emergency Antidotes & Tox',
        icon: 'Stethoscope',
        color: '#b45309',
        bg: '#fef3c7',
        badge: 'Acute Care',
        description: 'Rapid lookup of toxicology antidotes, hospital loading regimens, and monitoring pearls.',
        presetPrompts: [
          'What is the antidote for Paracetamol overdose and its IV regimen?',
          'What is the antidote for Opioid toxicity and Naloxone dosing?',
          'What is the antidote for Heparin and Protamine calculation?',
          'What is the antidote for Organophosphate poisoning and Atropine protocol?'
        ]
      },
      {
        id: 'naranjo',
        title: 'ADR Causality (Naranjo Scale)',
        icon: 'AlertTriangle',
        color: '#dc2626',
        bg: '#fef2f2',
        badge: 'Pharmacovigilance',
        description: 'Standard 10-question algorithm to classify adverse reactions as Definite, Probable, Possible, or Doubtful.',
        presetPrompts: [
          'Explain Naranjo algorithm score of 7 for Drug-Induced Rash',
          'What are the 10 questions of the Naranjo adverse event scale?',
          'How do I report a suspected ADR on the PvPI form?'
        ]
      },
      {
        id: 'curriculum',
        title: 'PCI Pharm.D 6-Year Syllabus',
        icon: 'BookOpen',
        color: '#006354',
        bg: '#edf7f4',
        badge: 'National Standards',
        description: 'Review subjects, clinical rotations, exam blueprints, and textbook citations from Year 1 to 6.',
        presetPrompts: [
          'What are the core subjects in 4th Year Pharm.D?',
          'Explain the 6th Year Pharm.D Hospital Clerkship requirements',
          'Recommended textbooks for Pharmacotherapeutics I, II, and III'
        ]
      },
      {
        id: 'quiz',
        title: 'Clinical Viva & Rapid Quiz',
        icon: 'Zap',
        color: '#d97706',
        bg: '#fffbeb',
        badge: 'Self-Assessment',
        description: 'Test your clinical pharmacy reflexes with spontaneous bedside case vignettes and rationales.',
        presetPrompts: [
          'Quiz me on Cardiology Pharmacotherapy',
          'Quiz me on Antimicrobial Stewardship & Renal Dosing',
          'Quiz me on Emergency Antidotes',
          'Quiz me on Drug Interactions in Critical Care'
        ]
      }
    ],
    quickChips: [
      '💊 Warfarin + NSAID Interaction',
      '🧪 Calculate CrCl (Age 68, 70kg, SCr 1.6)',
      '🧬 SGLT2i Mechanism of Action',
      '📋 Heart Failure SOAP Note',
      '🩺 Paracetamol Antidote Regimen',
      '⚠️ Naranjo ADR Scale',
      '📚 4th Year Subjects'
    ]
  };
}

function detectCategory(lower) {
  if (lower.includes('interaction') || lower.includes('contraindicat')) return 'interaction';
  if (lower.includes('crcl') || lower.includes('renal') || lower.includes('creatinine')) return 'renal';
  if (lower.includes('moa') || lower.includes('mechanism')) return 'moa';
  if (lower.includes('soap') || lower.includes('case note')) return 'soap';
  if (lower.includes('naranjo') || lower.includes('adr') || lower.includes('adverse')) return 'naranjo';
  if (lower.includes('antidote') || lower.includes('poison') || lower.includes('overdose')) return 'toxicology';
  if (lower.includes('syllabus') || lower.includes('pci') || lower.includes('year')) return 'curriculum';
  return 'general';
}

function generateSuggestions(lower) {
  if (lower.includes('warfarin') || lower.includes('interaction')) {
    return [
      'Check Clopidogrel + Omeprazole interaction',
      'What are the signs of Warfarin-induced bleeding?',
      'How often should INR be monitored after initiating NSAID?'
    ];
  }
  if (lower.includes('crcl') || lower.includes('renal')) {
    return [
      'Show Vancomycin trough target for severe infections',
      'Calculate CrCl for Female, Age 72, Weight 58kg, SCr 1.5',
      'Which oral anticoagulants are contraindicated in ESRD?'
    ];
  }
  if (lower.includes('moa') || lower.includes('sglt2')) {
    return [
      'Compare SGLT2 inhibitors vs GLP-1 receptor agonists',
      'Explain mechanism of euglycemic DKA with SGLT2i',
      'What are the four pillars of HFrEF medical therapy?'
    ];
  }
  if (lower.includes('soap')) {
    return [
      'Generate COPD Exacerbation SOAP Note',
      'What are the 8 primary Drug Therapy Problems (DTPs)?',
      'How to document patient counseling plan in hospital rounds?'
    ];
  }
  return [
    'Check drug-drug interaction',
    'Calculate Cockcroft-Gault CrCl',
    'Generate inpatient ward round SOAP note',
    'Review emergency toxicology antidotes'
  ];
}

module.exports = {
  processChatMessage,
  getChatbotMenu,
  calculateCrCl,
  evaluateNaranjo,
  generateSoapTemplate
};
