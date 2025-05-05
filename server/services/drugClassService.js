/**
 * Drug Class Service
 * 
 * This service handles classification, identification, and comparison of drugs
 * based on ATC codes, mechanism of action, or similar therapeutic categories.
 */

// Database of ATC codes for drug class identification
const atcCodeDatabase = {
  "Cardiovascular": {
    "C01": "Cardiac therapy",
    "C02": "Antihypertensives",
    "C03": "Diuretics",
    "C04": "Peripheral vasodilators",
    "C05": "Vasoprotectives",
    "C07": "Beta blocking agents",
    "C08": "Calcium channel blockers",
    "C09": "Agents acting on the renin-angiotensin system",
    "C10": "Lipid modifying agents"
  },
  "Respiratory": {
    "R01": "Nasal preparations",
    "R02": "Throat preparations",
    "R03": "Drugs for obstructive airway diseases",
    "R05": "Cough and cold preparations",
    "R06": "Antihistamines for systemic use",
    "R07": "Other respiratory system products"
  },
  "Nervous System": {
    "N01": "Anesthetics",
    "N02": "Analgesics",
    "N03": "Antiepileptics",
    "N04": "Anti-Parkinson drugs",
    "N05": "Psycholeptics",
    "N06": "Psychoanaleptics",
    "N07": "Other nervous system drugs"
  },
  "AntiInfectives": {
    "J01": "Antibacterials for systemic use",
    "J02": "Antimycotics for systemic use",
    "J04": "Antimycobacterials",
    "J05": "Antivirals for systemic use",
    "J06": "Immune sera and immunoglobulins"
  },
  "Antineoplastic": {
    "L01": "Antineoplastic agents",
    "L02": "Endocrine therapy",
    "L03": "Immunostimulants",
    "L04": "Immunosuppressants"
  }
};

// Database of common drug name mappings to classes for faster lookup
const drugClassMappings = {
  // Cardiovascular drugs
  "lisinopril": { class: "Cardiovascular", atc: "C09", moa: "ACE inhibitor" },
  "enalapril": { class: "Cardiovascular", atc: "C09", moa: "ACE inhibitor" },
  "ramipril": { class: "Cardiovascular", atc: "C09", moa: "ACE inhibitor" },
  "losartan": { class: "Cardiovascular", atc: "C09", moa: "Angiotensin II receptor blocker" },
  "valsartan": { class: "Cardiovascular", atc: "C09", moa: "Angiotensin II receptor blocker" },
  "amlodipine": { class: "Cardiovascular", atc: "C08", moa: "Calcium channel blocker" },
  "diltiazem": { class: "Cardiovascular", atc: "C08", moa: "Calcium channel blocker" },
  "metoprolol": { class: "Cardiovascular", atc: "C07", moa: "Beta blocker" },
  "atenolol": { class: "Cardiovascular", atc: "C07", moa: "Beta blocker" },
  "propranolol": { class: "Cardiovascular", atc: "C07", moa: "Beta blocker" },
  "furosemide": { class: "Cardiovascular", atc: "C03", moa: "Loop diuretic" },
  "hydrochlorothiazide": { class: "Cardiovascular", atc: "C03", moa: "Thiazide diuretic" },
  "simvastatin": { class: "Cardiovascular", atc: "C10", moa: "HMG-CoA reductase inhibitor" },
  "atorvastatin": { class: "Cardiovascular", atc: "C10", moa: "HMG-CoA reductase inhibitor" },
  "rosuvastatin": { class: "Cardiovascular", atc: "C10", moa: "HMG-CoA reductase inhibitor" },
  "warfarin": { class: "Cardiovascular", atc: "B01", moa: "Vitamin K antagonist" },
  "clopidogrel": { class: "Cardiovascular", atc: "B01", moa: "P2Y12 inhibitor" },
  "apixaban": { class: "Cardiovascular", atc: "B01", moa: "Factor Xa inhibitor" },
  "rivaroxaban": { class: "Cardiovascular", atc: "B01", moa: "Factor Xa inhibitor" },
  
  // Respiratory drugs
  "albuterol": { class: "Respiratory", atc: "R03", moa: "Short-acting beta agonist" },
  "salbutamol": { class: "Respiratory", atc: "R03", moa: "Short-acting beta agonist" },
  "salmeterol": { class: "Respiratory", atc: "R03", moa: "Long-acting beta agonist" },
  "formoterol": { class: "Respiratory", atc: "R03", moa: "Long-acting beta agonist" },
  "fluticasone": { class: "Respiratory", atc: "R03", moa: "Corticosteroid" },
  "budesonide": { class: "Respiratory", atc: "R03", moa: "Corticosteroid" },
  "beclomethasone": { class: "Respiratory", atc: "R03", moa: "Corticosteroid" },
  "tiotropium": { class: "Respiratory", atc: "R03", moa: "Long-acting muscarinic antagonist" },
  "ipratropium": { class: "Respiratory", atc: "R03", moa: "Short-acting muscarinic antagonist" },
  "montelukast": { class: "Respiratory", atc: "R03", moa: "Leukotriene receptor antagonist" },
  "zafirlukast": { class: "Respiratory", atc: "R03", moa: "Leukotriene receptor antagonist" },
  "loratadine": { class: "Respiratory", atc: "R06", moa: "Antihistamine" },
  "cetirizine": { class: "Respiratory", atc: "R06", moa: "Antihistamine" },
  
  // Nervous system drugs
  "morphine": { class: "Nervous System", atc: "N02", moa: "Opioid agonist" },
  "oxycodone": { class: "Nervous System", atc: "N02", moa: "Opioid agonist" },
  "fentanyl": { class: "Nervous System", atc: "N02", moa: "Opioid agonist" },
  "tramadol": { class: "Nervous System", atc: "N02", moa: "Opioid agonist" },
  "paracetamol": { class: "Nervous System", atc: "N02", moa: "Non-opioid analgesic" },
  "acetaminophen": { class: "Nervous System", atc: "N02", moa: "Non-opioid analgesic" },
  "ibuprofen": { class: "Musculoskeletal", atc: "M01", moa: "NSAID" },
  "naproxen": { class: "Musculoskeletal", atc: "M01", moa: "NSAID" },
  "diclofenac": { class: "Musculoskeletal", atc: "M01", moa: "NSAID" },
  "gabapentin": { class: "Nervous System", atc: "N03", moa: "Calcium channel modulator" },
  "pregabalin": { class: "Nervous System", atc: "N03", moa: "Calcium channel modulator" },
  "carbamazepine": { class: "Nervous System", atc: "N03", moa: "Sodium channel blocker" },
  "levodopa": { class: "Nervous System", atc: "N04", moa: "Dopamine precursor" },
  "fluoxetine": { class: "Nervous System", atc: "N06", moa: "SSRI" },
  "sertraline": { class: "Nervous System", atc: "N06", moa: "SSRI" },
  "citalopram": { class: "Nervous System", atc: "N06", moa: "SSRI" },
  "escitalopram": { class: "Nervous System", atc: "N06", moa: "SSRI" },
  "venlafaxine": { class: "Nervous System", atc: "N06", moa: "SNRI" },
  "duloxetine": { class: "Nervous System", atc: "N06", moa: "SNRI" },
  "amitriptyline": { class: "Nervous System", atc: "N06", moa: "TCA" },
  "diazepam": { class: "Nervous System", atc: "N05", moa: "Benzodiazepine" },
  "alprazolam": { class: "Nervous System", atc: "N05", moa: "Benzodiazepine" },
  "zolpidem": { class: "Nervous System", atc: "N05", moa: "Non-benzodiazepine hypnotic" },
  "haloperidol": { class: "Nervous System", atc: "N05", moa: "Typical antipsychotic" },
  "risperidone": { class: "Nervous System", atc: "N05", moa: "Atypical antipsychotic" },
  "olanzapine": { class: "Nervous System", atc: "N05", moa: "Atypical antipsychotic" },
  "quetiapine": { class: "Nervous System", atc: "N05", moa: "Atypical antipsychotic" },
  
  // Antiinfectives
  "amoxicillin": { class: "AntiInfectives", atc: "J01", moa: "Beta-lactam antibiotic" },
  "amoxicillin-clavulanate": { class: "AntiInfectives", atc: "J01", moa: "Beta-lactam antibiotic" },
  "cephalexin": { class: "AntiInfectives", atc: "J01", moa: "Cephalosporin antibiotic" },
  "ciprofloxacin": { class: "AntiInfectives", atc: "J01", moa: "Fluoroquinolone antibiotic" },
  "levofloxacin": { class: "AntiInfectives", atc: "J01", moa: "Fluoroquinolone antibiotic" },
  "azithromycin": { class: "AntiInfectives", atc: "J01", moa: "Macrolide antibiotic" },
  "clarithromycin": { class: "AntiInfectives", atc: "J01", moa: "Macrolide antibiotic" },
  "doxycycline": { class: "AntiInfectives", atc: "J01", moa: "Tetracycline antibiotic" },
  "fluconazole": { class: "AntiInfectives", atc: "J02", moa: "Azole antifungal" },
  "acyclovir": { class: "AntiInfectives", atc: "J05", moa: "Antiviral" },
  "oseltamivir": { class: "AntiInfectives", atc: "J05", moa: "Neuraminidase inhibitor" },
  
  // Antineoplastics
  "cyclophosphamide": { class: "Antineoplastic", atc: "L01", moa: "Alkylating agent" },
  "paclitaxel": { class: "Antineoplastic", atc: "L01", moa: "Antimicrotubular" },
  "docetaxel": { class: "Antineoplastic", atc: "L01", moa: "Antimicrotubular" },
  "fluorouracil": { class: "Antineoplastic", atc: "L01", moa: "Antimetabolite" },
  "methotrexate": { class: "Antineoplastic", atc: "L01", moa: "Antimetabolite" },
  "doxorubicin": { class: "Antineoplastic", atc: "L01", moa: "Anthracycline" },
  "epirubicin": { class: "Antineoplastic", atc: "L01", moa: "Anthracycline" },
  "trastuzumab": { class: "Antineoplastic", atc: "L01", moa: "Targeted therapy" },
  "rituximab": { class: "Antineoplastic", atc: "L01", moa: "Targeted therapy" },
  "tamoxifen": { class: "Antineoplastic", atc: "L02", moa: "Selective estrogen receptor modulator" },
  "anastrozole": { class: "Antineoplastic", atc: "L02", moa: "Aromatase inhibitor" },
  "letrozole": { class: "Antineoplastic", atc: "L02", moa: "Aromatase inhibitor" }
};

/**
 * Identifies drug class information based on the product name
 *
 * @param {string} productName - Name of the drug to classify
 * @returns {Object|null} - Object containing class information or null if not found
 */
function identifyDrugClass(productName) {
  // Convert to lowercase for case-insensitive matching
  const normalizedName = productName.toLowerCase();
  
  // Try direct match first
  for (const [drug, info] of Object.entries(drugClassMappings)) {
    if (normalizedName === drug || normalizedName.includes(drug)) {
      return {
        ...info,
        matchedTerm: drug
      };
    }
  }
  
  // No direct match found
  return null;
}

/**
 * Find similar drugs in the same class based on product name
 *
 * @param {string} productName - Name of the reference drug
 * @param {number} limit - Maximum number of similar drugs to return
 * @returns {Array} - Array of similar drugs in the same class
 */
function findSimilarDrugsInClass(productName, limit = 5) {
  const drugInfo = identifyDrugClass(productName);
  if (!drugInfo) {
    // No class information found for the product
    return [];
  }
  
  const similarDrugs = [];
  
  // First, look for drugs with the same MOA (strongest similarity)
  for (const [drug, info] of Object.entries(drugClassMappings)) {
    // Skip if it's the same drug
    if (productName.toLowerCase() === drug || productName.toLowerCase().includes(drug)) {
      continue;
    }
    
    // Check if it's in the same class with the same mechanism of action
    if (info.moa === drugInfo.moa) {
      similarDrugs.push({
        name: drug,
        similarity: 'high',
        class: info.class,
        atc: info.atc,
        moa: info.moa
      });
    }
  }
  
  // If we don't have enough with the same MOA, add drugs from the same ATC code
  if (similarDrugs.length < limit) {
    for (const [drug, info] of Object.entries(drugClassMappings)) {
      // Skip if already added or it's the same drug
      if (similarDrugs.some(d => d.name === drug) || 
          productName.toLowerCase() === drug || 
          productName.toLowerCase().includes(drug)) {
        continue;
      }
      
      // Check if it's in the same class with the same ATC code
      if (info.atc === drugInfo.atc) {
        similarDrugs.push({
          name: drug,
          similarity: 'medium',
          class: info.class,
          atc: info.atc,
          moa: info.moa
        });
      }
    }
  }
  
  // If we still don't have enough, add drugs from the same general class
  if (similarDrugs.length < limit) {
    for (const [drug, info] of Object.entries(drugClassMappings)) {
      // Skip if already added or it's the same drug
      if (similarDrugs.some(d => d.name === drug) || 
          productName.toLowerCase() === drug || 
          productName.toLowerCase().includes(drug)) {
        continue;
      }
      
      // Check if it's in the same general therapeutic class
      if (info.class === drugInfo.class) {
        similarDrugs.push({
          name: drug,
          similarity: 'low',
          class: info.class,
          atc: info.atc,
          moa: info.moa
        });
      }
    }
  }
  
  // Return the limited number of similar drugs
  return similarDrugs.slice(0, limit);
}

/**
 * Parses a drug name to remove common prefixes, suffixes, and formulations
 *
 * @param {string} drugName - Full drug name potentially with brand, dosage, etc.
 * @returns {string} - Cleaned generic drug name
 */
function parseGenericDrugName(drugName) {
  // Convert to lowercase
  let name = drugName.toLowerCase();
  
  // Remove common brand designations
  name = name.replace(/\b(brand|generic)\b/gi, '');
  
  // Remove common dosage forms
  const dosageForms = [
    'tablet', 'capsule', 'solution', 'injection', 'cream', 'ointment', 'gel',
    'patch', 'suppository', 'syrup', 'suspension', 'powder', 'er', 'xr', 'sr', 'ir'
  ];
  
  dosageForms.forEach(form => {
    name = name.replace(new RegExp(`\\b${form}\\b`, 'gi'), '');
  });
  
  // Remove dosage information (e.g., 10mg, 5ml)
  name = name.replace(/\b\d+\s*(mg|mcg|g|ml|l)\b/gi, '');
  
  // Remove common manufacturers
  const manufacturers = ['pfizer', 'bayer', 'novartis', 'roche', 'merck', 'gsk', 'astrazeneca'];
  manufacturers.forEach(mfg => {
    name = name.replace(new RegExp(`\\b${mfg}\\b`, 'gi'), '');
  });
  
  // Clean up extra spaces and trim
  name = name.replace(/\s+/g, ' ').trim();
  
  return name;
}

export {
  identifyDrugClass,
  findSimilarDrugsInClass,
  parseGenericDrugName
};
