/**
 * Drug Classification Service
 * 
 * Provides functionality to identify drug classifications and find comparable drugs
 * based on ATC code, mechanism of action (MoA), or therapeutic class.
 */
import axios from 'axios';

// Base URLs for data sources
const FDA_NDC_BASE_URL = 'https://api.fda.gov/drug/ndc.json';
const NIH_RX_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

/**
 * Resolve an NDC code to obtain detailed classification data
 * 
 * @param {string} ndcCode - NDC product code
 * @returns {Promise<Object>} - Classification data
 */
export async function resolveClassificationByNDC(ndcCode) {
  try {
    const response = await axios.get(`${FDA_NDC_BASE_URL}?search=product_ndc:"${ndcCode}"`);
    if (response.data && response.data.results && response.data.results.length > 0) {
      const product = response.data.results[0];
      return {
        productName: product.brand_name || product.generic_name,
        genericName: product.generic_name,
        pharm_class: product.pharm_class || [],
        atc_code: extractATCCode(product),
        route: product.route && product.route.length > 0 ? product.route[0] : '',
        ndc: ndcCode
      };
    }
    return null;
  } catch (error) {
    console.error('Error resolving classification by NDC:', error.message);
    return null;
  }
}

/**
 * Resolve a product name to obtain detailed classification data
 * 
 * @param {string} productName - Product/drug name
 * @returns {Promise<Object>} - Classification data
 */
export async function resolveClassificationByName(productName) {
  try {
    // First get the RxCUI from product name
    const rxcui = await getRxCUIFromName(productName);
    if (!rxcui) return null;
    
    // Then get the ATC code from RxCUI
    const atcCodes = await getATCCodesFromRxCUI(rxcui);
    
    // Get FDA classification info
    const fdaResponse = await axios.get(`${FDA_NDC_BASE_URL}?search=brand_name:"${productName}" OR generic_name:"${productName}"&limit=1`);
    
    let pharmClass = [];
    if (fdaResponse.data && fdaResponse.data.results && fdaResponse.data.results.length > 0) {
      pharmClass = fdaResponse.data.results[0].pharm_class || [];
    }
    
    return {
      productName,
      rxcui,
      atc_codes: atcCodes,
      pharm_class: pharmClass
    };
  } catch (error) {
    console.error('Error resolving classification by name:', error.message);
    return null;
  }
}

/**
 * Find comparable drugs based on ATC code (same class)
 * 
 * @param {string|Array} atcCodes - ATC code(s) to match
 * @param {number} limit - Maximum number of comparators to return
 * @returns {Promise<Array>} - List of comparable products
 */
export async function findComparatorsByATC(atcCodes, limit = 5) {
  if (!atcCodes || (Array.isArray(atcCodes) && atcCodes.length === 0)) {
    return [];
  }
  
  const codeList = Array.isArray(atcCodes) ? atcCodes : [atcCodes];
  const comparators = [];
  
  try {
    // For each ATC code, find drugs with the same classification
    for (const atcCode of codeList) {
      // Use first 4 characters of ATC code to get therapeutic subgroup
      const atcPrefix = atcCode.substring(0, 4);
      
      const response = await axios.get(`${FDA_NDC_BASE_URL}?search=openfda.pharm_class_epc:"${atcPrefix}"&limit=${limit}`);
      if (response.data && response.data.results) {
        for (const product of response.data.results) {
          // Don't include the original product in comparators
          if (product.brand_name !== productName) {
            comparators.push({
              name: product.brand_name || product.generic_name,
              generic_name: product.generic_name,
              atc_code: extractATCCode(product),
              product_ndc: product.product_ndc
            });
          }
          
          // Stop if we've reached the limit
          if (comparators.length >= limit) break;
        }
      }
      
      // Stop if we've reached the limit
      if (comparators.length >= limit) break;
    }
    
    return comparators;
  } catch (error) {
    console.error('Error finding comparators by ATC:', error.message);
    return [];
  }
}

/**
 * Find comparable drugs based on pharmacological class
 * 
 * @param {string|Array} pharmClass - Pharmacological class(es) to match
 * @param {number} limit - Maximum number of comparators to return
 * @returns {Promise<Array>} - List of comparable products
 */
export async function findComparatorsByPharmClass(pharmClass, limit = 5) {
  if (!pharmClass || (Array.isArray(pharmClass) && pharmClass.length === 0)) {
    return [];
  }
  
  const classList = Array.isArray(pharmClass) ? pharmClass : [pharmClass];
  const comparators = [];
  
  try {
    for (const drugClass of classList) {
      const response = await axios.get(`${FDA_NDC_BASE_URL}?search=openfda.pharm_class_epc:"${drugClass}"&limit=${limit}`);
      if (response.data && response.data.results) {
        for (const product of response.data.results) {
          comparators.push({
            name: product.brand_name || product.generic_name,
            generic_name: product.generic_name,
            pharm_class: product.pharm_class,
            product_ndc: product.product_ndc
          });
          
          if (comparators.length >= limit) break;
        }
      }
      
      if (comparators.length >= limit) break;
    }
    
    return comparators;
  } catch (error) {
    console.error('Error finding comparators by pharm class:', error.message);
    return [];
  }
}

/**
 * Get a RxCUI from a drug name using the RxNorm API
 * 
 * @param {string} name - Drug name to lookup
 * @returns {Promise<string|null>} - RxCUI or null if not found
 */
async function getRxCUIFromName(name) {
  try {
    const response = await axios.get(`${NIH_RX_BASE_URL}/rxcui.json?name=${encodeURIComponent(name)}`);
    if (response.data && response.data.idGroup && response.data.idGroup.rxnormId) {
      return response.data.idGroup.rxnormId[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting RxCUI from name:', error.message);
    return null;
  }
}

/**
 * Get ATC codes from RxCUI using the RxNorm API
 * 
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @returns {Promise<Array>} - List of ATC codes
 */
async function getATCCodesFromRxCUI(rxcui) {
  try {
    const response = await axios.get(`${NIH_RX_BASE_URL}/rxcui/${rxcui}/property.json?propName=ATC`);
    if (response.data && response.data.propConceptGroup && response.data.propConceptGroup.propConcept) {
      return response.data.propConceptGroup.propConcept.map(item => item.propValue);
    }
    return [];
  } catch (error) {
    console.error('Error getting ATC codes from RxCUI:', error.message);
    return [];
  }
}

/**
 * Extract ATC code from FDA product data
 * 
 * @param {Object} product - FDA product data
 * @returns {string|null} - ATC code or null if not found
 */
function extractATCCode(product) {
  if (product.openfda && product.openfda.pharm_class_atc) {
    return product.openfda.pharm_class_atc[0];
  }
  return null;
}
