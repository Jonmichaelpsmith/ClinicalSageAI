/**
 * FDA FAERS Service
 * 
 * This service provides a JavaScript interface to the FDA Adverse Event Reporting System (FAERS)
 * for fetching and analyzing adverse event data related to medical products.
 * 
 * The implementation is based on the Python FAERSClient code, translating its functionality
 * to JavaScript for use in our Express backend.
 */

import axios from 'axios';

// Base URLs for FDA APIs
const BASE_EVENT_URL = 'https://api.fda.gov/drug/event.json';
const BASE_LABEL_URL = 'https://api.fda.gov/drug/label.json';

/**
 * Resolve a brand name to a UNII (Unique Ingredient Identifier) code
 * 
 * @param {string} brandName - The brand name to resolve
 * @returns {Promise<Object>} - Object containing UNII code and confidence level
 */
async function resolveToUnii(brandName) {
  try {
    const params = {
      search: `openfda.brand_name:"${brandName}"`,
      limit: 1
    };
    
    const response = await axios.get(BASE_LABEL_URL, { params });
    
    if (response.status === 200) {
      const results = response.data.results || [];
      if (results.length > 0) {
        const openfda = results[0].openfda || {};
        const unii = openfda.unii ? openfda.unii[0] : null;
        const substanceName = openfda.substance_name ? openfda.substance_name[0] : null;
        
        return {
          unii,
          substanceName: substanceName || brandName,
          matchConfidence: unii ? 'high' : 'low'
        };
      }
    }
    
    return {
      unii: null,
      substanceName: brandName,
      matchConfidence: 'low'
    };
    
  } catch (error) {
    console.error('Error resolving UNII code:', error.message);
    return {
      unii: null,
      substanceName: brandName,
      matchConfidence: 'error'
    };
  }
}

/**
 * Fetch FAERS data by UNII code
 * 
 * @param {string} unii - The UNII code to search for
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of parsed FAERS reports
 */
async function fetchFaersDataByUnii(unii, limit = 100) {
  try {
    const params = {
      search: `patient.drug.openfda.unii:"${unii}"`,
      limit
    };
    
    const response = await axios.get(BASE_EVENT_URL, { params });
    
    if (response.status !== 200) {
      throw new Error(`FAERS fetch failed: ${response.statusText}`);
    }
    
    const results = response.data.results || [];
    const parsedResults = [];
    
    for (const entry of results) {
      const patient = entry.patient || {};
      const reactions = patient.reaction || [];
      const drugs = patient.drug || [];
      
      const demographics = {
        age: patient.patientonsetage,
        sex: patient.patientsex
      };
      
      for (const reaction of reactions) {
        parsedResults.push({
          substance: drugs.length > 0 ? (drugs[0].medicinalproduct || 'Unknown') : 'Unknown',
          unii,
          reaction: reaction.reactionmeddrapt,
          is_serious: entry.serious === 1,
          outcome: entry.seriousnessdeath ? 'Death' : 'Non-Death',
          report_date: entry.receivedate,
          age: demographics.age,
          sex: demographics.sex
        });
      }
    }
    
    return parsedResults;
    
  } catch (error) {
    console.error('Error fetching FAERS data by UNII:', error.message);
    throw error;
  }
}

/**
 * Compute a risk score based on FAERS reports
 * 
 * @param {Array} reports - Array of FAERS reports
 * @returns {number} - Computed risk score
 */
function computeRiskScore(reports) {
  const weights = {
    'Death': 3.0,
    'Hospitalization': 2.0,
    'Disability': 1.5
  };
  
  if (!reports || reports.length === 0) {
    return 0.0;
  }
  
  const score = reports.reduce((total, report) => {
    if (report.is_serious) {
      return total + (weights[report.outcome] || 1.0);
    }
    return total;
  }, 0);
  
  return parseFloat((score / reports.length).toFixed(2));
}

/**
 * Get comprehensive FAERS data for a product
 * 
 * @param {string} productName - Product name to search for
 * @returns {Promise<Object>} - Complete FAERS data including reports and risk score
 */
async function getFaersData(productName) {
  try {
    // Step 1: Resolve product name to UNII
    const resolvedProduct = await resolveToUnii(productName);
    console.log(`Resolved ${productName} to UNII: ${resolvedProduct.unii || 'Not found'}`);
    
    // Step 2: If we have a UNII, fetch data using it
    let reports = [];
    if (resolvedProduct.unii) {
      reports = await fetchFaersDataByUnii(resolvedProduct.unii);
    } else {
      // If no UNII found, try searching by brand name directly
      const params = {
        search: `patient.drug.medicinalproduct:"${productName}" OR patient.drug.openfda.brand_name:"${productName}"`,
        limit: 100
      };
      
      const response = await axios.get(BASE_EVENT_URL, { params });
      if (response.status === 200) {
        const results = response.data.results || [];
        // Convert to same format as fetchFaersDataByUnii
        for (const entry of results) {
          const patient = entry.patient || {};
          const reactions = patient.reaction || [];
          const drugs = patient.drug || [];
          
          for (const reaction of reactions) {
            reports.push({
              substance: drugs.length > 0 ? (drugs[0].medicinalproduct || productName) : productName,
              unii: null,
              reaction: reaction.reactionmeddrapt,
              is_serious: entry.serious === 1,
              outcome: entry.seriousnessdeath ? 'Death' : 'Non-Death',
              report_date: entry.receivedate,
              age: patient.patientonsetage,
              sex: patient.patientsex
            });
          }
        }
      }
    }
    
    console.log(`Found ${reports.length} FAERS reports for ${productName}`);
    
    // Step 3: Compute risk score
    const riskScore = computeRiskScore(reports);
    
    // Step 4: Organize FAERS data for frontend consumption
    // Count reaction frequencies
    const reactionCounts = {};
    reports.forEach(report => {
      if (report.reaction) {
        reactionCounts[report.reaction] = (reactionCounts[report.reaction] || 0) + 1;
      }
    });
    
    const sortedReactions = Object.entries(reactionCounts)
      .map(([reaction, count]) => ({ reaction, count }))
      .sort((a, b) => b.count - a.count);
    
    // Count demographics
    const demographics = {
      ageGroups: {
        '<18': 0,
        '18-44': 0,
        '45-64': 0,
        '65+': 0,
        'Unknown': 0
      },
      gender: {
        'Male': 0,
        'Female': 0,
        'Unknown': 0
      }
    };
    
    reports.forEach(report => {
      // Age grouping
      if (report.age) {
        const age = parseInt(report.age);
        let ageGroup = 'Unknown';
        
        if (!isNaN(age)) {
          if (age < 18) ageGroup = '<18';
          else if (age >= 18 && age < 45) ageGroup = '18-44';
          else if (age >= 45 && age < 65) ageGroup = '45-64';
          else if (age >= 65) ageGroup = '65+';
        }
        
        demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + 1;
      } else {
        demographics.ageGroups['Unknown'] = (demographics.ageGroups['Unknown'] || 0) + 1;
      }
      
      // Gender grouping
      if (report.sex) {
        const sexCode = parseInt(report.sex);
        let gender = 'Unknown';
        
        if (sexCode === 1) gender = 'Male';
        else if (sexCode === 2) gender = 'Female';
        
        demographics.gender[gender] = (demographics.gender[gender] || 0) + 1;
      } else {
        demographics.gender['Unknown'] = (demographics.gender['Unknown'] || 0) + 1;
      }
    });
    
    // Determine severity level based on risk score
    let severityAssessment = 'Low';
    if (riskScore > 1.5) severityAssessment = 'High';
    else if (riskScore > 0.5) severityAssessment = 'Medium';
    
    // Format data for frontend
    const result = {
      productName,
      resolvedInfo: resolvedProduct,
      totalReports: reports.length,
      riskScore,
      severityAssessment,
      reactionCounts: sortedReactions,
      topReactions: sortedReactions.slice(0, 10).map(r => r.reaction),
      seriousEvents: reports.filter(r => r.is_serious).map(r => r.reaction),
      demographics,
      reports: reports.slice(0, 50) // Limit report details to first 50
    };
    
    return result;
    
  } catch (error) {
    console.error('Error getting FAERS data:', error);
    throw error;
  }
}

// Only use ESM export
export {
  resolveToUnii,
  fetchFaersDataByUnii,
  computeRiskScore,
  getFaersData
};
