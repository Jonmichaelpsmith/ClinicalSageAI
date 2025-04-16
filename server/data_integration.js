/**
 * Data Integration Service
 * 
 * This module integrates data from multiple regulatory databases (FDA MAUDE, FDA FAERS, EU EUDAMED)
 * and provides a unified data model for generating Clinical Evaluation Reports (CERs).
 */

const fs = require('fs');
const path = require('path');
const { createCache } = require('./cache_manager');
const maudeClient = require('./fda_maude_client');
const faersClient = require('./fda_faers_client');
const eudamedClient = require('./eudamed_client');

// Create cache manager for integrated data
const cacheManager = createCache('integrated_data');

/**
 * Gather integrated data from all applicable regulatory databases
 * 
 * @param {Object} params Data gathering parameters
 * @param {string} params.productId Product identifier (NDC for drugs, product code for devices)
 * @param {string} params.productName Name of the product
 * @param {string} params.manufacturer Manufacturer name
 * @param {boolean} params.isDevice Whether the product is a medical device
 * @param {boolean} params.isDrug Whether the product is a drug
 * @param {number} params.dateRangeDays Number of days to look back for reports
 * @returns {Promise<Object>} Dictionary containing integrated data
 */
async function gatherIntegratedData({
  productId,
  productName,
  manufacturer,
  isDevice = true,
  isDrug = false,
  dateRangeDays = 730
}) {
  try {
    // Generate a cache key
    const cacheKey = `integrated_${productId}_${productName}_${isDevice}_${isDrug}_${dateRangeDays}`.replace(/\s+/g, '_');
    
    // Check if we have cached results
    const cachedData = await cacheManager.getCachedData(cacheKey);
    if (cachedData && cachedData.data) {
      console.log(`Retrieved integrated data from cache for ${productId || productName}`);
      return cachedData.data;
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRangeDays);
    
    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];
    
    console.log(`Gathering data for ${productName} (${productId}) from ${dateFrom} to ${dateTo}`);
    
    // Initialize data sources
    const dataSources = [];
    const tasks = [];
    const results = {};
    
    // Start device data collection if applicable
    if (isDevice) {
      // Get MAUDE data
      dataSources.push('FDA MAUDE');
      tasks.push(
        maudeClient.searchDeviceReports({
          deviceName: productName,
          productCode: productId,
          manufacturer: manufacturer,
          dateFrom: formatDateForMaude(dateFrom),
          dateTo: formatDateForMaude(dateTo)
        })
      );
      
      // Get EUDAMED data
      dataSources.push('EU EUDAMED');
      tasks.push(
        eudamedClient.searchVigilanceData({
          deviceName: productName,
          udiCode: productId,
          manufacturer: manufacturer,
          dateFrom: dateFrom,
          dateTo: dateTo
        })
      );
    }
    
    // Start drug data collection if applicable
    if (isDrug) {
      dataSources.push('FDA FAERS');
      tasks.push(
        faersClient.searchAdverseEvents({
          productNdc: productId,
          productName: productName,
          manufacturer: manufacturer,
          dateFrom: dateFrom,
          dateTo: dateTo
        })
      );
    }
    
    // Wait for all tasks to complete
    const responses = await Promise.all(tasks);
    
    // Process results
    let resultIndex = 0;
    
    if (isDevice) {
      // MAUDE data
      results.maudeData = responses[resultIndex++];
      
      // EUDAMED data
      results.eudamedData = responses[resultIndex++];
    }
    
    if (isDrug) {
      // FAERS data
      results.faersData = responses[resultIndex++];
    }
    
    // Create integrated data structure
    const integratedData = {
      productId: productId,
      productName: productName,
      manufacturer: manufacturer || "Unknown Manufacturer",
      retrievalDate: new Date().toISOString(),
      dateRange: {
        from: dateFrom,
        to: dateTo,
        days: dateRangeDays
      },
      isDevice: isDevice,
      isDrug: isDrug,
      sources: dataSources,
      integratedData: {
        maudeData: results.maudeData || null,
        faersData: results.faersData || null,
        eudamedData: results.eudamedData || null,
        summary: {}
      }
    };
    
    // Generate summary from the integrated data
    integratedData.integratedData.summary = generateIntegratedSummary(integratedData);
    
    // Cache the results
    await cacheManager.saveToCacheWithExpiry(cacheKey, integratedData, 24*60*60); // 24 hours
    
    console.log(`Successfully gathered data from ${dataSources.length} sources`);
    return integratedData;
  } catch (error) {
    console.error('Error gathering integrated data:', error.message);
    throw error;
  }
}

/**
 * Format date for MAUDE API
 * 
 * @param {string} dateStr ISO format date string (YYYY-MM-DD)
 * @returns {string} MAUDE format date string (MM/DD/YYYY)
 */
function formatDateForMaude(dateStr) {
  if (!dateStr) return '';
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

/**
 * Generate a comprehensive summary from all integrated data sources
 * 
 * @param {Object} integratedData Dictionary containing data from all sources
 * @returns {Object} Summary dictionary
 */
function generateIntegratedSummary(integratedData) {
  const sources = integratedData.sources || [];
  const data = integratedData.integratedData || {};
  
  // Initialize summary
  const summary = {
    sourcesRepresented: sources,
    totalEvents: 0,
    seriousEvents: 0,
    eventBySource: {},
    topEvents: [],
    sourceAnalysis: {}
  };
  
  // Analyze each source
  if (sources.includes('FDA MAUDE') && data.maudeData) {
    const maudeAnalysis = maudeClient.analyzeMaudeData(data.maudeData);
    summary.sourceAnalysis.maude = maudeAnalysis;
    summary.totalEvents += maudeAnalysis.total_reports || 0;
    summary.seriousEvents += maudeAnalysis.serious_events || 0;
    summary.eventBySource['FDA MAUDE'] = maudeAnalysis.total_reports || 0;
    
    // Add top events
    if (maudeAnalysis.most_common_event_types && maudeAnalysis.most_common_event_types.length > 0) {
      maudeAnalysis.most_common_event_types.slice(0, 3).forEach(([eventType, count]) => {
        summary.topEvents.push({
          name: eventType,
          count: count,
          source: 'FDA MAUDE'
        });
      });
    }
  }
  
  if (sources.includes('FDA FAERS') && data.faersData) {
    const faersAnalysis = faersClient.analyzeFaersData(data.faersData);
    summary.sourceAnalysis.faers = faersAnalysis;
    summary.totalEvents += faersAnalysis.total_reports || 0;
    summary.seriousEvents += faersAnalysis.serious_reports || 0;
    summary.eventBySource['FDA FAERS'] = faersAnalysis.total_reports || 0;
    
    // Add top events
    if (faersAnalysis.top_adverse_events && faersAnalysis.top_adverse_events.length > 0) {
      faersAnalysis.top_adverse_events.slice(0, 3).forEach(event => {
        summary.topEvents.push({
          name: event.term,
          count: event.count,
          source: 'FDA FAERS'
        });
      });
    }
  }
  
  if (sources.includes('EU EUDAMED') && data.eudamedData) {
    const eudamedAnalysis = eudamedClient.analyzeEudamedData(data.eudamedData);
    summary.sourceAnalysis.eudamed = eudamedAnalysis;
    
    // Add FSCA and incidents to total events
    const fscaCount = eudamedAnalysis.total_fsca || 0;
    const incidentCount = eudamedAnalysis.total_incidents || 0;
    
    summary.totalEvents += fscaCount + incidentCount;
    summary.seriousEvents += eudamedAnalysis.high_severity_incidents || 0;
    summary.eventBySource['EU EUDAMED'] = fscaCount + incidentCount;
    
    // Add FSCAs and high severity incidents to top events
    if (fscaCount > 0) {
      summary.topEvents.push({
        name: 'Field Safety Corrective Actions',
        count: fscaCount,
        source: 'EU EUDAMED'
      });
    }
    
    const highSeverity = eudamedAnalysis.high_severity_incidents || 0;
    if (highSeverity > 0) {
      summary.topEvents.push({
        name: 'High Severity Incidents',
        count: highSeverity,
        source: 'EU EUDAMED'
      });
    }
  }
  
  // Sort top events by count
  summary.topEvents.sort((a, b) => b.count - a.count);
  
  return summary;
}

module.exports = {
  gatherIntegratedData
};