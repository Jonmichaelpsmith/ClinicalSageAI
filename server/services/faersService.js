/**
 * FAERS Service
 *
 * This service provides functionality for fetching, analyzing, and processing data
 * from the FDA Adverse Event Reporting System (FAERS).
 */

import * as drugClassService from './drugClassService.js';

// Mock FAERS database for development/demo purposes
const faersDatabase = {
  // Simulated FAERS data for common medications
  "lisinopril": {
    productName: "Lisinopril",
    totalReports: 5784,
    seriousEvents: Array(1246).fill("serious"),
    topReactions: ["cough", "dizziness", "headache", "hypotension", "fatigue"],
    reactionCounts: [
      { reaction: "cough", count: 1245 },
      { reaction: "dizziness", count: 872 },
      { reaction: "headache", count: 643 },
      { reaction: "hypotension", count: 421 },
      { reaction: "fatigue", count: 387 },
      { reaction: "nausea", count: 298 },
      { reaction: "rash", count: 275 },
      { reaction: "angioedema", count: 267 },
      { reaction: "hyperkalemia", count: 184 },
      { reaction: "syncope", count: 162 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 78,
        "19-44": 1045,
        "45-64": 2341,
        "65+": 2320
      },
      gender: {
        "Female": 3128,
        "Male": 2585,
        "Unknown": 71
      }
    },
    riskScore: 0.58,
    severityAssessment: "Medium",
    resolvedInfo: {
      unii: "7Q3P4BS2FD",
      substanceName: "Lisinopril"
    }
  },
  "enalapril": {
    productName: "Enalapril",
    totalReports: 4231,
    seriousEvents: Array(876).fill("serious"),
    topReactions: ["cough", "dizziness", "headache", "hypotension", "rash"],
    reactionCounts: [
      { reaction: "cough", count: 982 },
      { reaction: "dizziness", count: 651 },
      { reaction: "headache", count: 524 },
      { reaction: "hypotension", count: 384 },
      { reaction: "rash", count: 342 },
      { reaction: "fatigue", count: 289 },
      { reaction: "nausea", count: 245 },
      { reaction: "angioedema", count: 213 },
      { reaction: "hyperkalemia", count: 156 },
      { reaction: "abdominal pain", count: 142 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 64,
        "19-44": 843,
        "45-64": 1782,
        "65+": 1542
      },
      gender: {
        "Female": 2285,
        "Male": 1875,
        "Unknown": 71
      }
    },
    riskScore: 0.42,
    severityAssessment: "Medium",
    resolvedInfo: {
      unii: "MHG789U5W9",
      substanceName: "Enalapril"
    }
  },
  "amlodipine": {
    productName: "Amlodipine",
    totalReports: 7892,
    seriousEvents: Array(1423).fill("serious"),
    topReactions: ["peripheral edema", "dizziness", "headache", "flushing", "palpitations"],
    reactionCounts: [
      { reaction: "peripheral edema", count: 2156 },
      { reaction: "dizziness", count: 1245 },
      { reaction: "headache", count: 985 },
      { reaction: "flushing", count: 842 },
      { reaction: "palpitations", count: 724 },
      { reaction: "fatigue", count: 456 },
      { reaction: "nausea", count: 387 },
      { reaction: "abdominal pain", count: 284 },
      { reaction: "dyspnea", count: 247 },
      { reaction: "rash", count: 215 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 98,
        "19-44": 1562,
        "45-64": 3211,
        "65+": 3021
      },
      gender: {
        "Female": 4246,
        "Male": 3521,
        "Unknown": 125
      }
    },
    riskScore: 0.72,
    severityAssessment: "Medium",
    resolvedInfo: {
      unii: "1J444QC288",
      substanceName: "Amlodipine"
    }
  },
  "metoprolol": {
    productName: "Metoprolol",
    totalReports: 6532,
    seriousEvents: Array(1312).fill("serious"),
    topReactions: ["fatigue", "dizziness", "bradycardia", "hypotension", "shortness of breath"],
    reactionCounts: [
      { reaction: "fatigue", count: 1842 },
      { reaction: "dizziness", count: 1562 },
      { reaction: "bradycardia", count: 1235 },
      { reaction: "hypotension", count: 1024 },
      { reaction: "shortness of breath", count: 856 },
      { reaction: "headache", count: 745 },
      { reaction: "nausea", count: 512 },
      { reaction: "depression", count: 432 },
      { reaction: "insomnia", count: 356 },
      { reaction: "cold extremities", count: 298 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 87,
        "19-44": 1245,
        "45-64": 2654,
        "65+": 2546
      },
      gender: {
        "Female": 3421,
        "Male": 3025,
        "Unknown": 86
      }
    },
    riskScore: 0.65,
    severityAssessment: "Medium",
    resolvedInfo: {
      unii: "GEB06NHM23",
      substanceName: "Metoprolol"
    }
  },
  "atorvastatin": {
    productName: "Atorvastatin",
    totalReports: 9354,
    seriousEvents: Array(1987).fill("serious"),
    topReactions: ["muscle pain", "myalgia", "liver enzyme increase", "headache", "fatigue"],
    reactionCounts: [
      { reaction: "muscle pain", count: 2657 },
      { reaction: "myalgia", count: 2342 },
      { reaction: "liver enzyme increase", count: 1456 },
      { reaction: "headache", count: 984 },
      { reaction: "fatigue", count: 876 },
      { reaction: "rhabdomyolysis", count: 378 },
      { reaction: "memory loss", count: 356 },
      { reaction: "dizziness", count: 324 },
      { reaction: "nausea", count: 287 },
      { reaction: "joint pain", count: 265 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 125,
        "19-44": 1756,
        "45-64": 3698,
        "65+": 3775
      },
      gender: {
        "Female": 4876,
        "Male": 4334,
        "Unknown": 144
      }
    },
    riskScore: 0.87,
    severityAssessment: "Medium",
    resolvedInfo: {
      unii: "48A5M73Z4Q",
      substanceName: "Atorvastatin"
    }
  },
  "acetaminophen": {
    productName: "Acetaminophen",
    totalReports: 14853,
    seriousEvents: Array(3921).fill("serious"),
    topReactions: ["liver injury", "nausea", "abdominal pain", "vomiting", "rash"],
    reactionCounts: [
      { reaction: "liver injury", count: 3256 },
      { reaction: "nausea", count: 2654 },
      { reaction: "abdominal pain", count: 2431 },
      { reaction: "vomiting", count: 1987 },
      { reaction: "rash", count: 1456 },
      { reaction: "headache", count: 1245 },
      { reaction: "dizziness", count: 984 },
      { reaction: "elevated liver enzymes", count: 876 },
      { reaction: "jaundice", count: 756 },
      { reaction: "pruritus", count: 654 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 2354,
        "19-44": 4765,
        "45-64": 4532,
        "65+": 3202
      },
      gender: {
        "Female": 8123,
        "Male": 6524,
        "Unknown": 206
      }
    },
    riskScore: 1.24,
    severityAssessment: "Medium",
    resolvedInfo: {
      unii: "362O9ITL9D",
      substanceName: "Acetaminophen"
    }
  },
  "amoxicillin": {
    productName: "Amoxicillin",
    totalReports: 8765,
    seriousEvents: Array(1543).fill("serious"),
    topReactions: ["rash", "diarrhea", "nausea", "vomiting", "abdominal pain"],
    reactionCounts: [
      { reaction: "rash", count: 2987 },
      { reaction: "diarrhea", count: 2342 },
      { reaction: "nausea", count: 1765 },
      { reaction: "vomiting", count: 1324 },
      { reaction: "abdominal pain", count: 1243 },
      { reaction: "pruritus", count: 876 },
      { reaction: "anaphylaxis", count: 354 },
      { reaction: "angioedema", count: 324 },
      { reaction: "headache", count: 287 },
      { reaction: "elevated liver enzymes", count: 176 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 2987,
        "19-44": 2765,
        "45-64": 1876,
        "65+": 1137
      },
      gender: {
        "Female": 4876,
        "Male": 3765,
        "Unknown": 124
      }
    },
    riskScore: 0.92,
    severityAssessment: "Medium",
    resolvedInfo: {
      unii: "804826J2HU",
      substanceName: "Amoxicillin"
    }
  },
  "fluoxetine": {
    productName: "Fluoxetine",
    totalReports: 7654,
    seriousEvents: Array(1987).fill("serious"),
    topReactions: ["nausea", "headache", "insomnia", "anxiety", "sexual dysfunction"],
    reactionCounts: [
      { reaction: "nausea", count: 2154 },
      { reaction: "headache", count: 1876 },
      { reaction: "insomnia", count: 1654 },
      { reaction: "anxiety", count: 1543 },
      { reaction: "sexual dysfunction", count: 1435 },
      { reaction: "diarrhea", count: 1243 },
      { reaction: "dizziness", count: 987 },
      { reaction: "dry mouth", count: 876 },
      { reaction: "fatigue", count: 765 },
      { reaction: "suicidal ideation", count: 432 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 765,
        "19-44": 3876,
        "45-64": 2354,
        "65+": 659
      },
      gender: {
        "Female": 4876,
        "Male": 2654,
        "Unknown": 124
      }
    },
    riskScore: 1.54,
    severityAssessment: "High",
    resolvedInfo: {
      unii: "01K63SUP8D",
      substanceName: "Fluoxetine"
    }
  },
  // Default fallback data for any unknown product
  "default": {
    productName: "",
    totalReports: 625,
    seriousEvents: Array(42).fill("serious"),
    topReactions: ["headache", "nausea", "dizziness", "fatigue", "rash"],
    reactionCounts: [
      { reaction: "headache", count: 145 },
      { reaction: "nausea", count: 132 },
      { reaction: "dizziness", count: 114 },
      { reaction: "fatigue", count: 87 },
      { reaction: "rash", count: 76 },
      { reaction: "vomiting", count: 65 },
      { reaction: "abdominal pain", count: 58 },
      { reaction: "insomnia", count: 49 },
      { reaction: "anxiety", count: 46 },
      { reaction: "joint pain", count: 44 }
    ],
    demographics: {
      ageGroups: {
        "0-18": 42,
        "19-44": 265,
        "45-64": 184,
        "65+": 134
      },
      gender: {
        "Female": 345,
        "Male": 272,
        "Unknown": 8
      }
    },
    riskScore: 0.45,
    severityAssessment: "Medium",
    resolvedInfo: null
  }
};

/**
 * Find a similar match for the product name in the database
 * 
 * @param {string} name - The name to search for
 * @returns {string|null} - A matching product name or null if no matches
 */
function findSimilarProduct(name) {
  if (!name) return null;
  
  const normalizedName = name.toLowerCase();
  
  // Try exact match first
  if (faersDatabase[normalizedName]) {
    return normalizedName;
  }
  
  // Try parsing the generic name
  const parsedName = drugClassService.parseGenericDrugName(normalizedName);
  if (faersDatabase[parsedName]) {
    return parsedName;
  }
  
  // Try partial match
  for (const drug in faersDatabase) {
    if (drug !== 'default' && normalizedName.includes(drug)) {
      return drug;
    }
  }
  
  // No match found
  return null;
}

/**
 * Get FAERS data for a specific product
 * 
 * @param {string} productName - The name of the product to get data for
 * @returns {Object} - FAERS data for the product
 */
async function getFaersData(productName) {
  if (!productName) {
    throw new Error('Product name is required');
  }
  
  // Find a matching product in our database
  const matchedProduct = findSimilarProduct(productName.toLowerCase());
  
  if (matchedProduct) {
    // Return a copy of the data with the requested product name
    const data = { ...faersDatabase[matchedProduct] };
    data.productName = productName; // Use the original product name from the request
    return data;
  }
  
  // No match found, return the default data with the requested product name
  const defaultData = { ...faersDatabase.default };
  defaultData.productName = productName;
  return defaultData;
}

/**
 * Get FAERS data with comparative analysis of similar drugs in the same class
 * 
 * @param {string} productName - The name of the product to get data for
 * @param {Object} options - Options for the request
 * @param {boolean} options.includeComparators - Whether to include comparator drugs
 * @param {number} options.comparatorLimit - Maximum number of comparators to include
 * @returns {Object} - FAERS data for the product with comparative analysis
 */
async function getFaersDataWithComparators(productName, options = {}) {
  const { includeComparators = true, comparatorLimit = 3 } = options;
  
  // Get the basic FAERS data for the product
  const faersData = await getFaersData(productName);
  
  // If comparators are not requested, return just the basic data
  if (!includeComparators) {
    return faersData;
  }
  
  // Find similar drugs in the same class
  const cleanedProductName = drugClassService.parseGenericDrugName(productName);
  let similarDrugs = drugClassService.findSimilarDrugsInClass(cleanedProductName, comparatorLimit);
  
  // If no similar drugs were found in the drug class service, look in our FAERS database
  if (similarDrugs.length === 0) {
    const matchedProduct = findSimilarProduct(productName.toLowerCase());
    if (matchedProduct) {
      // Just get available drugs in our FAERS database
      similarDrugs = Object.keys(faersDatabase)
        .filter(drug => drug !== 'default' && drug !== matchedProduct)
        .slice(0, comparatorLimit)
        .map(drug => ({ name: drug }));
    }
  }
  
  // Get FAERS data for each similar drug
  const comparators = [];
  
  for (const drug of similarDrugs) {
    try {
      const comparatorData = await getFaersData(drug.name);
      
      comparators.push({
        comparator: drug.name,
        reportCount: comparatorData.totalReports,
        riskScore: comparatorData.riskScore,
        seriousEventsCount: comparatorData.seriousEvents.length,
        similarityReason: drug.moa || 'Similar therapeutic class',
        atcCode: drug.atc || 'Unknown',
        therapeuticClass: drug.class || 'Unknown'
      });
    } catch (error) {
      console.error(`Error getting FAERS data for comparator ${drug.name}:`, error);
      // Continue with the next drug
    }
  }
  
  // Return the enhanced data with comparators
  return {
    ...faersData,
    comparators
  };
}

// Export the functions
export {
  getFaersData,
  getFaersDataWithComparators
};
