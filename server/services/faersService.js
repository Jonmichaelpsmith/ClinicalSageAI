/**
 * FAERS Service
 *
 * This service provides functionality for fetching, analyzing, and processing data
 * from the FDA Adverse Event Reporting System (FAERS).
 * 
 * IMPORTANT: This service uses only authentic FDA data with no synthetic data fallbacks.
 * If the FDA API is unavailable, the service will return appropriate error messages
 * rather than generating alternative data.
 * 
 * Version 2.0.1 - May 7, 2025
 */

import axios from 'axios';

// FDA FAERS API base URL
const FDA_API_BASE_URL = 'https://api.fda.gov/drug/event.json';

// Configure axios instance with proper timeout and retry logic
const fdaAxios = axios.create({
  timeout: 30000, // 30 second timeout
  headers: {
    'Accept': 'application/json'
  }
});

// Add response interceptor for error handling
fdaAxios.interceptors.response.use(
  response => response, 
  async error => {
    const { config, response } = error;
    
    // If this is a rate limit error (429) and we haven't retried yet
    if (response && response.status === 429 && !config._isRetry) {
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark as retried and try again
      config._isRetry = true;
      return fdaAxios(config);
    }
    
    return Promise.reject(error);
  }
);

// Utility function for safely making FDA API requests with proper error handling
const safeFdaApiRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    console.error('FDA API Error:', error.message);
    
    // Handle connection errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('FDA API request timed out. Please try again later.');
    }
    
    // Handle API response errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data || {};
      
      if (status === 404) {
        throw new Error('No data found in FDA database for this query.');
      } else if (status === 429) {
        throw new Error('FDA API rate limit exceeded. Please try again in a few minutes.');
      } else {
        throw new Error(`FDA API error: ${data.error || error.message}`);
      }
    } else if (error.request) {
      throw new Error('No response received from FDA API. Please check your network connection.');
    } else {
      throw new Error(`Error preparing FDA API request: ${error.message}`);
    }
  }
};

/**
 * Fetch real FAERS data from the FDA API
 * 
 * This function retrieves adverse event data directly from the FDA's FAERS database
 * via the official FDA API with proper error handling and no synthetic data fallbacks.
 * 
 * @param {string} productName - The name of the product to search for
 * @param {Object} options - Options for the API request
 * @param {number} options.limit - Maximum number of results to return
 * @returns {Promise<Object>} - FDA FAERS data
 */
async function fetchRealFaersData(productName, options = {}) {
  const { limit = 100 } = options;
  
  // Sanitize product name for API query
  const sanitizedName = productName.replace(/[^\w\s]/gi, '').trim();
  
  // Construct FDA API query
  const query = `patient.drug.openfda.brand_name:"${sanitizedName}" OR patient.drug.openfda.generic_name:"${sanitizedName}" OR patient.drug.openfda.substance_name:"${sanitizedName}"`;
  
  console.log(`Querying FDA FAERS API for: ${sanitizedName}`);
  console.log(`Full query: ${query}`);
  
  // Use our safe FDA API request utility
  return await safeFdaApiRequest(async () => {
    // Make API request to FDA using our configured axios instance
    const response = await fdaAxios.get(FDA_API_BASE_URL, {
      params: {
        search: query,
        limit: limit
      }
    });
    
    // Log successful API response
    console.log(`FDA FAERS API response: ${response.status}`);
    console.log(`Found ${response.data.meta.results.total} total records`);
    
    // Return the data
    return response.data;
  }).catch(error => {
    // For 404 errors (no data found), return empty result set instead of throwing
    if (error.message.includes('No data found')) {
      console.log(`No FAERS data found for product: ${productName}`);
      return { meta: { results: { total: 0 } }, results: [] };
    }
    
    // For other errors, rethrow
    throw error;
  });
}

/**
 * Transform raw FDA FAERS data into a structured format for the CER
 * 
 * @param {Object} rawData - Raw FDA FAERS API response
 * @param {string} productName - The name of the product
 * @returns {Object} - Structured FAERS data
 */
function transformFaersData(rawData, productName) {
  try {
    if (!rawData || !rawData.results || !Array.isArray(rawData.results)) {
      console.warn('Invalid or empty FAERS data received');
      return {
        product: productName,
        totalReports: 0,
        reports: []
      };
    }
    
    const totalReports = rawData.meta?.results?.total || rawData.results.length;
    console.log(`Transforming ${totalReports} FAERS reports for ${productName}`);
    
    // Extract and structure reports
    const reports = rawData.results.map((result, index) => {
      // Get patient data
      const patient = result.patient || {};
      const patientInfo = {
        gender: patient.patientsex === '1' ? 'Male' : 
                patient.patientsex === '2' ? 'Female' : 'Unknown',
        age: patient.patientonsetage ? parseInt(patient.patientonsetage) : null,
        ageUnit: patient.patientonsetageunit || null,
        weight: patient.patientweight ? parseFloat(patient.patientweight) : null
      };
      
      // Get reaction data
      const reactions = patient.reaction || [];
      const reactionsList = reactions.map(r => r.reactionmeddrapt).filter(Boolean);
      
      // Determine if serious
      const seriousOutcomes = ['DEATH', 'LIFE-THREATENING', 'HOSPITALIZATION', 'DISABILITY', 'CONGENITAL ANOMALY'];
      const patientOutcomes = result.patient?.patientoutcome || [];
      const seriousOutcomeFound = patientOutcomes.some(outcome => 
        outcome.patientoutcomecodept && seriousOutcomes.includes(outcome.patientoutcomecodept.toUpperCase())
      );
      
      // Get drug info
      const drugs = patient.drug || [];
      const targetDrug = drugs.find(d => {
        const brandNames = (d.openfda?.brand_name || []).map(name => name.toLowerCase());
        const genericNames = (d.openfda?.generic_name || []).map(name => name.toLowerCase());
        const substanceNames = (d.openfda?.substance_name || []).map(name => name.toLowerCase());
        
        const productNameLower = productName.toLowerCase();
        return brandNames.includes(productNameLower) || 
               genericNames.includes(productNameLower) || 
               substanceNames.includes(productNameLower);
      }) || drugs[0] || {};
      
      return {
        id: result.safetyreportid || `report-${index + 1}`,
        receiveDate: result.receivedate,
        reportType: result.serious ? 'Serious' : 'Non-serious',
        is_serious: seriousOutcomeFound || !!result.serious,
        patient: patientInfo,
        reactions: reactionsList,
        primaryReaction: reactionsList[0] || 'Unknown',
        drugInfo: {
          name: targetDrug.medicinalproduct || productName,
          indication: targetDrug.drugindication || 'Not specified',
          dosage: targetDrug.drugdosagetext || 'Not specified',
          route: targetDrug.drugadministrationroute || 'Not specified'
        }
      };
    });
    
    // Count serious reports
    const seriousReportsCount = reports.filter(r => r.is_serious).length;
    console.log(`Found ${seriousReportsCount} serious reports out of ${reports.length} total`);
    
    // Return structured data
    return {
      product: productName,
      totalReports,
      seriousReportsCount,
      reports
    };
  } catch (error) {
    console.error('Error transforming FAERS data:', error);
    return {
      product: productName,
      totalReports: 0,
      seriousReportsCount: 0,
      reports: [],
      error: error.message
    };
  }
}

/**
 * Find similar product names in the FDA database
 * 
 * Uses the FDA API to find products with similar names for comparison purposes
 * in clinical evaluation reports.
 * 
 * @param {string} name - The name to search for
 * @returns {Promise<Array<string>>} - List of similar product names
 */
async function findSimilarProductInFDA(name) {
  const sanitizedName = name.replace(/[^\w\s]/gi, '').trim();
  const words = sanitizedName.split(/\s+/);
  
  // Search for the first word, which is often the brand name
  const firstWord = words[0];
  const query = `openfda.brand_name:${firstWord}* OR openfda.generic_name:${firstWord}*`;
  
  console.log(`Finding similar products for: ${name}`);
  console.log(`Using search term: ${firstWord}`);
  
  return await safeFdaApiRequest(async () => {
    const response = await fdaAxios.get(FDA_API_BASE_URL, {
      params: {
        search: query,
        count: 'patient.drug.openfda.brand_name',
        limit: 5
      }
    });
    
    const results = response.data.results || [];
    const terms = results.map(r => r.term);
    
    console.log(`Found ${terms.length} similar products`);
    return terms;
  }).catch(error => {
    console.error('Error finding similar products:', error);
    return []; // Return empty array on error
  });
}

/**
 * Get FAERS data for a specific product from FDA FAERS API
 * 
 * @param {string} productName - The name of the product to get data for
 * @param {Object} options - Options for the request
 * @param {number} options.limit - Maximum number of results to return from FDA API
 * @returns {Promise<Object|null>} - FAERS data for the product or null if no data available
 */
async function getFaersData(productName, options = {}) {
  try {
    if (!productName) {
      throw new Error('Product name is required');
    }
    
    console.log(`Getting FAERS data for product: ${productName}`);
    
    // Always use real data from FDA API
    const rawData = await fetchRealFaersData(productName, {
      limit: options.limit || 100
    });
    
    // Check if we got data back
    if (rawData.meta.results.total === 0) {
      console.log(`No FAERS data found for ${productName}. Checking for similar products...`);
      const similarProducts = await findSimilarProductInFDA(productName);
      
      if (similarProducts.length > 0) {
        console.log(`Found similar products: ${similarProducts.join(', ')}`);
        // Return the data with similar products but no reports
        return {
          product: productName,
          totalReports: 0,
          seriousReportsCount: 0,
          reports: [],
          similarProducts
        };
      }
      
      console.log(`No similar products found for ${productName}`);
      return {
        product: productName,
        totalReports: 0,
        seriousReportsCount: 0,
        reports: [],
        message: 'No adverse event data found for this product in the FDA FAERS database.'
      };
    }
    
    // Transform the raw data
    const transformedData = transformFaersData(rawData, productName);
    console.log(`Successfully processed FAERS data for ${productName}`);
    
    return transformedData;
  } catch (error) {
    console.error(`Error getting FAERS data for ${productName}:`, error);
    
    // Return an error response with clear messaging
    return {
      product: productName,
      totalReports: 0,
      seriousReportsCount: 0,
      reports: [],
      error: true,
      message: `Error retrieving FDA FAERS data: ${error.message}`,
      technicalDetails: error.stack
    };
  }
}

/**
 * Get FAERS data with comparative analysis of similar drugs in the same class
 * 
 * @param {string} productName - The name of the product to get data for
 * @param {Object} options - Options for the request
 * @param {boolean} options.includeComparators - Whether to include comparator drugs
 * @param {number} options.comparatorLimit - Maximum number of comparators to include
 * @returns {Promise<Object|null>} - FAERS data for the product with comparative analysis or null if not found
 */
async function getFaersDataWithComparators(productName, options = {}) {
  try {
    const { includeComparators = true, comparatorLimit = 3 } = options;
    
    // Get primary product data
    const productData = await getFaersData(productName, options);
    
    if (!includeComparators) {
      return productData;
    }
    
    // Find similar products for comparison only if we have product data
    if (productData && productData.totalReports > 0) {
      console.log(`Finding comparator products for ${productName}`);
      const similarProducts = await findSimilarProductInFDA(productName);
      
      // Filter out the original product from comparators
      const comparators = similarProducts
        .filter(name => name.toLowerCase() !== productName.toLowerCase())
        .slice(0, comparatorLimit);
      
      if (comparators.length === 0) {
        console.log(`No comparator products found for ${productName}`);
        return {
          ...productData,
          comparativeAnalysis: {
            performed: false,
            reason: 'No suitable comparator products identified'
          }
        };
      }
      
      // Get data for comparators
      const comparatorDataPromises = comparators.map(comparator => 
        getFaersData(comparator, { limit: 50 })
      );
      
      const comparatorResults = await Promise.all(comparatorDataPromises);
      const validComparators = comparatorResults.filter(c => c && c.totalReports > 0);
      
      console.log(`Retrieved data for ${validComparators.length} comparator products`);
      
      // Add comparative analysis
      return {
        ...productData,
        comparativeAnalysis: {
          performed: true,
          comparators: validComparators.map(c => ({
            name: c.product,
            totalReports: c.totalReports,
            seriousReportsCount: c.seriousReportsCount,
            seriousPercent: c.totalReports > 0 ? (c.seriousReportsCount / c.totalReports) * 100 : 0
          }))
        }
      };
    }
    
    return productData;
  } catch (error) {
    console.error(`Error getting comparative FAERS data for ${productName}:`, error);
    
    // Return basic product data without comparators
    return await getFaersData(productName, options);
  }
}

/**
 * Analyze FAERS data to create a comprehensive report for CER
 * 
 * @param {Object} faersData - FAERS data for analysis 
 * @param {Object} options - Analysis options
 * @param {string} options.productName - Product name override
 * @param {string} options.manufacturerName - Manufacturer name
 * @param {Object} options.context - Additional context info
 * @returns {Object} - Analyzed FAERS data for CER
 */
async function analyzeFaersDataForCER(faersData, options = {}) {
  try {
    if (!faersData || (!faersData.reports && !faersData.error)) {
      throw new Error('Invalid FAERS data provided for analysis');
    }
    
    const product = options.productName || faersData.product;
    const manufacturer = options.manufacturerName || 'Not specified';
    const context = options.context || {};
    
    console.log(`Analyzing FAERS data for CER: ${product}`);
    
    // If there was an error or no data, return a clear message
    if (faersData.error || faersData.totalReports === 0) {
      return {
        product,
        manufacturer,
        analysisDate: new Date().toISOString(),
        dataAvailable: false,
        reason: faersData.message || 'No adverse event data found in FDA FAERS database',
        recommendation: 'Consider including a statement in the CER that no adverse events were found in the FDA FAERS database for this product.'
      };
    }
    
    // Extract key metrics
    const totalReports = faersData.totalReports;
    const seriousCount = faersData.seriousReportsCount;
    const seriousPercent = totalReports > 0 ? (seriousCount / totalReports) * 100 : 0;
    
    // Count reaction frequencies
    const reactionCounts = {};
    faersData.reports.forEach(report => {
      report.reactions.forEach(reaction => {
        reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
      });
    });
    
    // Get most common reactions
    const sortedReactions = Object.entries(reactionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        percent: (count / totalReports) * 100
      }));
    
    // Determine risk assessment
    let riskAssessment = 'Low Risk';
    let riskRationale = 'Few adverse events reported overall.';
    
    if (seriousPercent > 30) {
      riskAssessment = 'High Risk';
      riskRationale = 'High percentage of serious adverse events reported.';
    } else if (seriousPercent > 15 || totalReports > 500) {
      riskAssessment = 'Moderate Risk';
      riskRationale = 'Moderate number of serious adverse events or large volume of reports.';
    }
    
    // Compile comparative analysis if available
    let comparativeFindings = null;
    if (faersData.comparativeAnalysis && faersData.comparativeAnalysis.performed) {
      const comparators = faersData.comparativeAnalysis.comparators || [];
      
      if (comparators.length > 0) {
        // Calculate average serious event rate for comparators
        const avgComparatorSeriousRate = comparators.reduce((sum, comp) => 
          sum + comp.seriousPercent, 0) / comparators.length;
        
        // Compare to product serious rate
        const relativeSeriousRate = seriousPercent / avgComparatorSeriousRate;
        
        comparativeFindings = {
          comparatorCount: comparators.length,
          productSeriousRate: seriousPercent.toFixed(1) + '%',
          avgComparatorSeriousRate: avgComparatorSeriousRate.toFixed(1) + '%',
          relativeSeriousRate: relativeSeriousRate.toFixed(2),
          interpretation: relativeSeriousRate < 0.8 ? 
            'Lower serious adverse event rate than comparable products' :
            relativeSeriousRate > 1.2 ?
            'Higher serious adverse event rate than comparable products' :
            'Similar serious adverse event rate to comparable products'
        };
      }
    }
    
    return {
      product,
      manufacturer,
      analysisDate: new Date().toISOString(),
      dataAvailable: true,
      dataSource: 'FDA FAERS Database',
      reportPeriod: {
        start: context.periodStart || '10 years prior',
        end: context.periodEnd || new Date().toISOString().split('T')[0]
      },
      reportCounts: {
        total: totalReports,
        serious: seriousCount,
        seriousPercent: seriousPercent.toFixed(1) + '%'
      },
      risk: {
        assessment: riskAssessment,
        rationale: riskRationale
      },
      topReactions: sortedReactions.slice(0, 10),
      comparativeAnalysis: comparativeFindings,
      limitations: [
        'FDA FAERS data includes spontaneous reports and may be subject to reporting bias',
        'Causality between product and reported events is not established in FAERS data',
        'Reporting rates may be influenced by product age, media attention, and regulatory actions'
      ],
      recommendation: 'These findings should be considered alongside clinical trial data and other safety information sources.'
    };
  } catch (error) {
    console.error('Error analyzing FAERS data for CER:', error);
    return {
      product: options.productName || 'Unknown product',
      analysisDate: new Date().toISOString(),
      dataAvailable: false,
      error: true,
      reason: `Analysis error: ${error.message}`,
      recommendation: 'Technical error occurred during analysis. Consider re-running the analysis or contacting support.'
    };
  }
}

export default {
  fetchRealFaersData,
  transformFaersData,
  findSimilarProductInFDA,
  getFaersData,
  getFaersDataWithComparators,
  analyzeFaersDataForCER
};