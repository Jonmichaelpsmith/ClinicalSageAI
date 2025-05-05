import express from 'express';
import { generateMockCER, generateFullCER, getCERReport, analyzeLiteratureWithAI, analyzeAdverseEventsWithAI } from '../services/cerService.js';
import { fetchFaersData, analyzeFaersDataForCER } from '../services/fdaService.js';
import * as faersService from '../services/faersService.js';

const router = express.Router();

// GET /api/cer/reports - Retrieve user's CER reports
router.get('/reports', async (req, res) => {
  try {
    // TODO: Replace with real DB lookup in production
    const sampleReports = [
      { 
        id: 'CER20250410001', 
        title: 'CardioMonitor Pro 3000 - EU MDR Clinical Evaluation',
        status: 'final',
        deviceName: 'CardioMonitor Pro 3000',
        deviceType: 'Patient Monitoring Device',
        manufacturer: 'MedTech Innovations, Inc.',
        templateUsed: 'EU MDR 2017/745 Full Template',
        generatedAt: '2025-04-10T14:23:45Z',
        lastModified: '2025-04-12T09:15:22Z',
        pageCount: 78,
        wordCount: 28506,
        sections: 14,
        projectId: 'PR-CV-2025-001',
        metadata: {
          includedLiterature: 42,
          includedAdverseEvents: 18,
          aiEnhanced: true,
          automatedWorkflow: true,
          regulatoryFrameworks: ['EU MDR', 'MEDDEV 2.7/1 Rev 4'],
          generationEngine: 'gpt-4o',
          citationCount: 47,
          qualityScore: 0.94
        }
      },
      {
        id: 'CER20250315002',
        title: 'NeuroPulse Implant - MEDDEV Clinical Evaluation',
        status: 'draft',
        deviceName: 'NeuroPulse Implant',
        deviceType: 'Implantable Medical Device',
        manufacturer: 'Neural Systems Ltd.',
        templateUsed: 'MEDDEV 2.7/1 Rev 4 Template',
        generatedAt: '2025-03-15T10:08:31Z',
        lastModified: '2025-03-15T10:08:31Z',
        pageCount: 64,
        wordCount: 22145,
        sections: 12,
        projectId: 'PR-IM-2025-002',
        metadata: {
          includedLiterature: 35,
          includedAdverseEvents: 12,
          aiEnhanced: true,
          automatedWorkflow: true,
          regulatoryFrameworks: ['EU MDR', 'MEDDEV 2.7/1 Rev 4'],
          generationEngine: 'gpt-4o',
          citationCount: 38,
          qualityScore: 0.91
        }
      },
      {
        id: 'CER20250329003',
        title: 'LaserScan X500 - FDA 510(k) Clinical Evaluation',
        status: 'final',
        deviceName: 'LaserScan X500',
        deviceType: 'Diagnostic Equipment',
        manufacturer: 'OptiMed Devices, Inc.',
        templateUsed: 'FDA 510(k) Template',
        generatedAt: '2025-03-29T16:42:19Z',
        lastModified: '2025-04-01T11:33:57Z',
        pageCount: 52,
        wordCount: 18230,
        sections: 10,
        projectId: 'PR-DG-2025-003',
        metadata: {
          includedLiterature: 29,
          includedAdverseEvents: 8,
          aiEnhanced: true,
          automatedWorkflow: true,
          regulatoryFrameworks: ['FDA 510(k)'],
          generationEngine: 'gpt-4o',
          citationCount: 31,
          qualityScore: 0.93
        }
      }
    ];
    
    res.json(sampleReports);
  } catch (error) {
    console.error('Error fetching CER reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/cer/report/:id - Get a specific CER report
router.get('/report/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getCERReport(id);
    res.json(report);
  } catch (error) {
    console.error(`Error fetching CER report ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// POST /api/cer/generate-full - Generate a full CER report
router.post('/generate-full', async (req, res) => {
  try {
    const { deviceInfo, literature, fdaData, templateId } = req.body;
    
    // Generate CER with enhanced AI workflow
    const report = await generateFullCER({ deviceInfo, literature, fdaData, templateId });
    res.json(report);
  } catch (error) {
    console.error('Error generating full CER:', error);
    res.status(500).json({ error: 'Failed to generate CER report' });
  }
});

// POST /api/cer/sample - Generate a sample CER
router.post('/sample', async (req, res) => {
  try {
    const { template } = req.body;
    
    // Generate a URL to a sample CER based on the template
    const sampleUrl = `/samples/cer-${template}-sample.pdf`;
    
    res.json({ url: sampleUrl });
  } catch (error) {
    console.error('Error generating sample CER:', error);
    res.status(500).json({ error: 'Failed to generate sample' });
  }
});

// GET /api/cer/workflows/:id - Get workflow status
router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulate a workflow status response
    res.json({
      id,
      status: 'processing',
      progress: 0.65,
      currentStep: 'sectionGeneration',
      steps: [
        { id: 'dataPreparation', name: 'Data Preparation', status: 'completed', completedAt: new Date(Date.now() - 180000).toISOString() },
        { id: 'aiAnalysis', name: 'AI Analysis', status: 'completed', completedAt: new Date(Date.now() - 120000).toISOString() },
        { id: 'sectionGeneration', name: 'Section Generation', status: 'processing', startedAt: new Date(Date.now() - 60000).toISOString() },
        { id: 'qualityCheck', name: 'Quality Check', status: 'pending' },
        { id: 'finalCompilation', name: 'Final Compilation', status: 'pending' }
      ],
      estimatedCompletionTime: new Date(Date.now() + 120000).toISOString() // 2 minutes from now
    });
  } catch (error) {
    console.error(`Error fetching workflow ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch workflow status' });
  }
});

// POST /api/cer/analyze/literature - Analyze literature with AI
router.post('/analyze/literature', async (req, res) => {
  try {
    const { literature } = req.body;
    
    // Call AI analysis service
    const analysis = await analyzeLiteratureWithAI(literature);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing literature with AI:', error);
    res.status(500).json({ error: 'Failed to analyze literature' });
  }
});

// POST /api/cer/analyze/adverse-events - Analyze FDA adverse events with AI
router.post('/analyze/adverse-events', async (req, res) => {
  try {
    const { fdaData } = req.body;
    
    // Call AI analysis service
    const analysis = await analyzeAdverseEventsWithAI(fdaData);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing adverse events with AI:', error);
    res.status(500).json({ error: 'Failed to analyze adverse events' });
  }
});

// GET /api/cer/faers/data - Fetch adverse event data from FDA FAERS database
router.get('/faers/data', async (req, res) => {
  try {
    const { productName, manufacturerName, startDate, endDate, limit } = req.query;
    
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    // Use the enhanced FAERS service which includes UNII resolution and risk scoring
    const faersData = await faersService.getFaersData(productName);
    
    res.json(faersData);
  } catch (error) {
    console.error('Error fetching FAERS data:', error);
    res.status(500).json({ error: 'Failed to fetch FAERS data' });
  }
});

// POST /api/cer/fetch-faers - Fetch and store FAERS data for a specific CER including comparator analysis
router.post('/fetch-faers', async (req, res) => {
  try {
    const { productName, cerId, includeComparators = true, comparatorLimit = 3 } = req.body;
    
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    if (!cerId) {
      return res.status(400).json({ error: 'CER ID is required' });
    }
    
    // Step 1: Fetch FAERS data with comparator analysis using our enhanced service
    console.log(`Fetching FAERS data for product: ${productName}, CER ID: ${cerId}, with comparators: ${includeComparators}`);
    
    // Use the new comparative analysis service
    const faersData = await faersService.getFaersDataWithComparators(productName, {
      includeComparators,
      comparatorLimit: parseInt(comparatorLimit, 10)
    });
    
    // Step 2: Save FAERS data to database
    // This would use the faersDbService in a production implementation
    // const dbService = require('../services/faersDbService');
    // const savedReports = await dbService.saveReports(faersData.reports);
    // const savedAnalysis = await dbService.saveCachedAnalysis(faersData);
    
    // Step 3: Return processed data including comparators
    const responseData = {
      success: true,
      productName,
      cerId,
      reports: faersData.reports,
      riskScore: faersData.riskScore,
      reportCount: faersData.totalReports,
      seriousEvents: faersData.seriousEvents,
      topReactions: faersData.topReactions,
      reactionCounts: faersData.reactionCounts,
      demographics: faersData.demographics,
      severityAssessment: faersData.severityAssessment,
      message: `Successfully imported ${faersData.totalReports} FAERS reports for ${productName}`
    };
    
    // Add comparator data if it exists
    if (faersData.comparators && faersData.comparators.length > 0) {
      responseData.comparators = faersData.comparators;
      responseData.message += ` with ${faersData.comparators.length} comparative products analyzed.`;
    }
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching and storing FAERS data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch and store FAERS data',
      message: error.message
    });
  }
});

// GET /api/cer/faers/analysis - Get analyzed FAERS data for CER inclusion with comparative analysis
router.get('/faers/analysis', async (req, res) => {
  try {
    const { productName, includeComparators = 'true' } = req.query;
    
    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    
    // Use the enhanced FAERS service to get data with comparators
    const includeComparatorsBoolean = includeComparators === 'true';
    
    const faersData = await faersService.getFaersDataWithComparators(productName, {
      includeComparators: includeComparatorsBoolean,
      comparatorLimit: 5
    });
    
    // Format the response specifically for CER inclusion
    const analysis = {
      productInfo: {
        name: faersData.productName,
        unii: faersData.resolvedInfo?.unii || null,
        substanceName: faersData.resolvedInfo?.substanceName || faersData.productName
      },
      reportingPeriod: {
        start: "2020-01-01",  // In production, this should be dynamically determined
        end: new Date().toISOString().split('T')[0],
        durationMonths: 48
      },
      summary: {
        totalReports: faersData.totalReports,
        seriousEvents: faersData.seriousEvents.length,
        seriousEventsPercentage: `${((faersData.seriousEvents.length / faersData.totalReports) * 100).toFixed(1)}%`,
        eventsPerTenThousand: (faersData.riskScore * 100).toFixed(2),
        severityAssessment: faersData.severityAssessment
      },
      topEvents: faersData.reactionCounts.slice(0, 10).map(item => ({
        event: item.reaction,
        count: item.count,
        percentage: `${((item.count / faersData.totalReports) * 100).toFixed(1)}%`
      })),
      demographics: {
        ageDistribution: Object.entries(faersData.demographics.ageGroups)
          .map(([group, count]) => ({
            group,
            count,
            percentage: `${((count / faersData.totalReports) * 100).toFixed(1)}%`
          })),
        genderDistribution: Object.entries(faersData.demographics.gender)
          .map(([gender, count]) => ({
            gender,
            count,
            percentage: `${((count / faersData.totalReports) * 100).toFixed(1)}%`
          }))
      }
    };
    
    // Add comparator analysis if available
    if (faersData.comparators && faersData.comparators.length > 0) {
      analysis.comparativeAnalysis = {
        products: faersData.comparators.map(comp => ({
          name: comp.comparator,
          riskScore: comp.riskScore,
          reportCount: comp.reportCount,
          severityAssessment: getSeverityLevel(comp.riskScore),
          relativeSafety: getRelativeSafety(faersData.riskScore, comp.riskScore)
        })),
        summary: `Compared to ${faersData.comparators.length} similar products in its class, ${productName} shows ${getComparativeConclusion(faersData)}`
      };
      
      // Enhanced conclusion with comparative data
      analysis.conclusion = `Based on the analysis of ${faersData.totalReports} adverse event reports from the FDA FAERS database, ${faersData.productName} demonstrates a ${faersData.severityAssessment.toLowerCase()} risk profile with ${faersData.seriousEvents.length} serious events reported. The most common adverse events were ${faersData.topReactions.slice(0, 3).join(', ')}. ${analysis.comparativeAnalysis.summary} This data should be considered in the overall benefit-risk assessment of the device.`;
    } else {
      // Standard conclusion without comparators
      analysis.conclusion = `Based on the analysis of ${faersData.totalReports} adverse event reports from the FDA FAERS database, ${faersData.productName} demonstrates a ${faersData.severityAssessment.toLowerCase()} risk profile with ${faersData.seriousEvents.length} serious events reported. The most common adverse events were ${faersData.topReactions.slice(0, 3).join(', ')}. This data should be considered in the overall benefit-risk assessment of the device.`;
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing FAERS data for CER:', error);
    res.status(500).json({ 
      error: 'Failed to analyze FAERS data for CER',
      message: error.message 
    });
  }
});

// Helper function to determine severity level based on risk score
function getSeverityLevel(riskScore) {
  if (riskScore > 1.5) return 'High';
  if (riskScore > 0.5) return 'Medium';
  return 'Low';
}

// Helper function to determine relative safety compared to reference product
function getRelativeSafety(referenceScore, comparatorScore) {
  const ratio = comparatorScore / referenceScore;
  
  if (ratio < 0.8) return 'better';
  if (ratio > 1.2) return 'worse';
  return 'similar';
}

// Helper function to generate comparative conclusion
function getComparativeConclusion(faersData) {
  if (!faersData.comparators || faersData.comparators.length === 0) {
    return '';
  }
  
  // Count comparative ratings
  const safetyCounts = {
    better: 0,
    similar: 0,
    worse: 0
  };
  
  faersData.comparators.forEach(comp => {
    const relativeSafety = getRelativeSafety(faersData.riskScore, comp.riskScore);
    safetyCounts[relativeSafety]++;
  });
  
  // Generate conclusion based on counts
  if (safetyCounts.better > safetyCounts.worse && safetyCounts.better > safetyCounts.similar) {
    return `a more favorable safety profile than most similar products in its class.`;
  }
  
  if (safetyCounts.worse > safetyCounts.better && safetyCounts.worse > safetyCounts.similar) {
    return `a less favorable safety profile than most similar products in its class.`;
  }
  
  if (safetyCounts.similar > safetyCounts.better && safetyCounts.similar > safetyCounts.worse) {
    return `a safety profile consistent with other products in its class.`;
  }
  
  // Mixed results
  if (safetyCounts.better === safetyCounts.worse) {
    return `a variable safety profile compared to other products in its class.`;
  }
  
  return `a safety profile that should be evaluated in context with other products in its class.`;
}

// POST /api/cer/export/:id - Export CER to various formats
router.post('/export/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body; // pdf, docx, html, etc.
    
    // Simulate export processing
    setTimeout(() => {
      res.json({
        id,
        format,
        url: `/api/cer/exports/${id}.${format}`,
        status: 'completed',
        exportedAt: new Date().toISOString()
      });
    }, 1500);
  } catch (error) {
    console.error(`Error exporting CER ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to export CER' });
  }
});

// GET /api/cer/templates - Get available CER templates
router.get('/templates', (req, res) => {
  try {
    const templates = [
      {
        id: 'eu-mdr-full',
        name: 'EU MDR 2017/745 Full Template',
        description: 'Complete template for EU MDR 2017/745 compliance',
        regulatoryFramework: 'EU MDR',
        sectionCount: 14,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'de', 'it', 'es'],
        aiEnhanced: true,
        lastUpdated: '2025-03-01T00:00:00Z'
      },
      {
        id: 'meddev-rev4',
        name: 'MEDDEV 2.7/1 Rev 4 Template',
        description: 'Template following MEDDEV 2.7/1 Rev 4 guidelines',
        regulatoryFramework: 'MEDDEV',
        sectionCount: 12,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'de'],
        aiEnhanced: true,
        lastUpdated: '2025-02-15T00:00:00Z'
      },
      {
        id: 'fda-510k',
        name: 'FDA 510(k) Template',
        description: 'Template for FDA 510(k) clinical evaluation',
        regulatoryFramework: 'FDA',
        sectionCount: 10,
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        aiEnhanced: true,
        lastUpdated: '2025-01-20T00:00:00Z'
      },
      {
        id: 'pmcf',
        name: 'PMCF Evaluation Report Template',
        description: 'Post-Market Clinical Follow-up report template',
        regulatoryFramework: 'EU MDR',
        sectionCount: 8,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'de', 'it', 'es'],
        aiEnhanced: true,
        lastUpdated: '2025-04-05T00:00:00Z'
      }
    ];
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching CER templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

export { router as default };

// Export for CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = router;
}