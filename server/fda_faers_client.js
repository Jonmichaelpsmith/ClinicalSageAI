/**
 * FDA FAERS Client
 * 
 * This module provides direct access to the FDA FAERS (FDA Adverse Event Reporting System) database
 * which contains information on adverse event and medication error reports submitted to FDA.
 * 
 * API Source: https://api.fda.gov/drug/event.json
 * Dashboard: https://fis.fda.gov/sense/app/95239e26-e0be-42d9-a960-9a5f7f1c25ee/sheet/7a47a261-d58b-4203-a8aa-6d3021737452/state/analysis
 */

const https = require('https');
const querystring = require('querystring');
const { createCache } = require('./cache_manager');

// Create cache manager for FDA FAERS data
const cacheManager = createCache('fda_faers');

// Constants
const FDA_FAERS_BASE_URL = "https://api.fda.gov/drug/event.json";

/**
 * Make an HTTP request
 * 
 * @param {string} url URL to request
 * @param {Object} queryParams Query parameters
 * @returns {Promise<Object>} Promise resolving to response JSON
 */
function makeRequest(url, queryParams = {}) {
  return new Promise((resolve, reject) => {
    // Add query parameters
    const queryString = querystring.stringify(queryParams);
    const requestUrl = queryString ? `${url}?${queryString}` : url;
    
    const urlObj = new URL(requestUrl);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'LumenTrialGuide.AI CER Generator/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(responseBody);
            resolve(jsonData);
          } catch (e) {
            reject(new Error(`Failed to parse response body: ${e.message}`));
          }
        } else {
          try {
            const errorData = JSON.parse(responseBody);
            reject(new Error(errorData.error ? errorData.error.message : `HTTP Error: ${res.statusCode}`));
          } catch (e) {
            reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage || ''}`));
          }
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

/**
 * Search for adverse events in the FDA FAERS database
 * 
 * @param {Object} params Search parameters
 * @param {string} params.productNdc NDC code for the drug
 * @param {string} params.productName Drug name to search for
 * @param {string} params.manufacturer Manufacturer name
 * @param {string} params.dateFrom Start date in YYYY-MM-DD format
 * @param {string} params.dateTo End date in YYYY-MM-DD format
 * @param {number} params.limit Maximum number of results to return
 * @returns {Promise<Object>} Promise resolving to search results
 */
async function searchAdverseEvents({
  productNdc = '',
  productName = '',
  manufacturer = '',
  dateFrom = '',
  dateTo = '',
  limit = 100
} = {}) {
  try {
    // Generate a cache key based on search parameters
    const cacheKey = `faers_search_${productNdc}_${productName}_${manufacturer}_${dateFrom}_${dateTo}`.replace(/\s+/g, '_');
    
    // Check if we have cached results
    const cachedData = await cacheManager.getCachedData(cacheKey);
    if (cachedData && cachedData.data) {
      console.log(`Retrieved FAERS data from cache for ${productNdc || productName}`);
      return cachedData.data;
    }
    
    console.log(`Fetching FAERS data for ${productNdc || productName}...`);
    
    // Build API query
    let apiQuery = '';
    
    if (productNdc) {
      apiQuery = `openfda.product_ndc:"${productNdc}"`;
    } else if (productName) {
      apiQuery = `patient.drug.openfda.brand_name:"${productName}" OR patient.drug.openfda.generic_name:"${productName}"`;
    } else {
      throw new Error('Either NDC code or product name is required');
    }
    
    if (manufacturer) {
      apiQuery += ` AND patient.drug.openfda.manufacturer_name:"${manufacturer}"`;
    }
    
    if (dateFrom || dateTo) {
      const dateRangeQuery = [];
      
      if (dateFrom) {
        dateRangeQuery.push(`receivedate:[${dateFrom.replace(/-/g, '')} TO `);
      } else {
        dateRangeQuery.push(`receivedate:[19000101 TO `);
      }
      
      if (dateTo) {
        dateRangeQuery.push(`${dateTo.replace(/-/g, '')}]`);
      } else {
        dateRangeQuery.push(`${new Date().toISOString().slice(0, 10).replace(/-/g, '')}]`);
      }
      
      apiQuery += ` AND ${dateRangeQuery.join('')}`;
    }
    
    // Set up query parameters
    const queryParams = {
      search: apiQuery,
      limit: limit.toString(),
      count: 'patient.reaction.reactionmeddrapt.exact'
    };
    
    try {
      // Make the API request
      const response = await makeRequest(FDA_FAERS_BASE_URL, queryParams);
      
      // Transform the data for our needs
      const transformedResponse = {
        meta: {
          disclaimer: response.meta?.disclaimer || "API data comes with limitations and should not be used as the sole basis for medical decisions.",
          terms: response.meta?.terms || "See FDA terms of service.",
          license: response.meta?.license || "Data available through open license.",
          last_updated: response.meta?.last_updated || new Date().toISOString().slice(0, 10),
          total_records: response.meta?.results?.total || 0
        },
        results: {
          product_characteristics: {
            product_ndc: productNdc || "Unknown",
            product_name: productName || "Unknown",
            manufacturer: manufacturer || "Unknown"
          },
          report_counts: {
            total: response.meta?.results?.total || 0,
            serious: 0, // To be calculated
            non_serious: 0, // To be calculated
          },
          adverse_events: []
        },
        source: "FDA FAERS"
      };
      
      // Extract reaction counts
      if (response.results) {
        transformedResponse.results.adverse_events = response.results.map(result => ({
          term: result.term,
          count: result.count
        }));
      }
      
      // Cache the transformed response
      await cacheManager.saveToCacheWithExpiry(cacheKey, transformedResponse, 24*60*60); // 24 hours
      
      console.log(`Retrieved FAERS data with ${transformedResponse.results.adverse_events.length} adverse events`);
      return transformedResponse;
    } catch (apiError) {
      console.error('FAERS API request failed:', apiError.message);
      
      // Check for API specific errors
      if (apiError.message.includes('No matches found')) {
        return {
          meta: {
            disclaimer: "FDA FAERS API data is limited in scope.",
            last_updated: new Date().toISOString().slice(0, 10),
            total_records: 0
          },
          results: {
            product_characteristics: {
              product_ndc: productNdc || "Unknown",
              product_name: productName || "Unknown",
              manufacturer: manufacturer || "Unknown"
            },
            report_counts: {
              total: 0,
              serious: 0,
              non_serious: 0
            },
            adverse_events: []
          },
          source: "FDA FAERS"
        };
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching FDA FAERS data:', error.message);
    
    // Return a structured error response
    return {
      error: error.message,
      results: {
        product_characteristics: {
          product_ndc: productNdc || "Unknown",
          product_name: productName || "Unknown"
        },
        report_counts: {
          total: 0
        },
        adverse_events: []
      },
      source: "FDA FAERS"
    };
  }
}

/**
 * Analyze FAERS data for trends and insights
 * 
 * @param {Object} faersData FAERS data object
 * @returns {Object} Analysis results
 */
function analyzeFaersData(faersData) {
  try {
    if (!faersData || !faersData.results) {
      return {
        total_reports: 0,
        summary: "No FAERS data available for analysis."
      };
    }
    
    const results = faersData.results;
    const totalReports = results.report_counts?.total || 0;
    
    // If no reports, return early
    if (totalReports === 0) {
      return {
        total_reports: 0,
        summary: "No adverse event reports found in FAERS."
      };
    }
    
    // Extract product details
    const productName = results.product_characteristics?.product_name || "Unknown Product";
    const productNdc = results.product_characteristics?.product_ndc || "Unknown NDC";
    
    // Analyze adverse events
    const adverseEvents = results.adverse_events || [];
    
    // Categorize events by severity
    // This is a simplified approach - in reality would need medical expertise or additional API data
    const seriousTerms = [
      'DEATH', 'CARDIAC ARREST', 'MYOCARDIAL INFARCTION', 'STROKE', 'RENAL FAILURE',
      'HEPATIC FAILURE', 'RESPIRATORY FAILURE', 'ANAPHYLACTIC', 'SEPSIS',
      'HOSPITALI', 'FATAL', 'SUICIDE', 'COMA', 'LIFE THREATENING'
    ];
    
    let seriousCount = 0;
    let nonSeriousCount = 0;
    
    const topAdverseEvents = adverseEvents
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Categorize events
    for (const event of adverseEvents) {
      const term = event.term.toUpperCase();
      const isSeriousEvent = seriousTerms.some(seriousTerm => term.includes(seriousTerm));
      
      if (isSeriousEvent) {
        seriousCount += event.count;
      } else {
        nonSeriousCount += event.count;
      }
    }
    
    // If FAERS provided total but didn't break down serious/non-serious,
    // ensure the totals match by adjusting non-serious
    if (seriousCount + nonSeriousCount !== totalReports) {
      nonSeriousCount = totalReports - seriousCount;
    }
    
    // Create summary
    return {
      total_reports: totalReports,
      serious_reports: seriousCount,
      non_serious_reports: nonSeriousCount,
      product_name: productName,
      product_ndc: productNdc,
      top_adverse_events: topAdverseEvents,
      summary: `Analysis of ${totalReports} FAERS reports for ${productName} found ${seriousCount} serious adverse events.`
    };
  } catch (error) {
    console.error('Error analyzing FAERS data:', error.message);
    return {
      total_reports: faersData?.results?.report_counts?.total || 0,
      error: error.message
    };
  }
}

module.exports = {
  searchAdverseEvents,
  analyzeFaersData
};