/**
 * FDA 510(k) API Routes
 * 
 * This file implements the backend API endpoints to support the 510(k) Automation
 * features within the Medical Device and Diagnostics module.
 */

import express, { Request, Response } from 'express';
import { createPool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create router
const router = express.Router();

// Database connection
const pool = createPool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Multi-tenancy middleware to extract and validate organization context
const extractTenantContext = (req: Request, res: Response, next: Function) => {
  const organizationId = req.headers['x-organization-id'] as string || null;
  const clientWorkspaceId = req.headers['x-client-workspace-id'] as string || null;
  
  // Attach tenant context to request object for downstream use
  (req as any).tenantContext = {
    organizationId,
    clientWorkspaceId
  };
  
  next();
};

// Apply tenant context middleware to all routes
router.use(extractTenantContext);

/**
 * GET /api/fda510k/health
 * Health check endpoint to verify API is operational
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Simple database connection check
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      databaseConnected: !!result.rows[0],
      apiVersion: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/fda510k/predicate-search
 * Search for potential predicate devices based on device information
 */
router.post('/predicate-search', async (req: Request, res: Response) => {
  try {
    const { 
      deviceName, 
      deviceType, 
      productCode, 
      deviceClass, 
      medicalSpecialty, 
      intendedUse, 
      keywords 
    } = req.body;
    
    const tenantContext = (req as any).tenantContext;
    
    console.log('510(k) Predicate search request:', {
      deviceName,
      deviceType,
      productCode,
      tenantContext
    });
    
    // For this MVP implementation we're returning simulated data
    // In a production environment, this would integrate with FDA database APIs
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return simulated predicate device data
    const results = {
      predicateDevices: [
        {
          id: 'K123456',
          deviceName: 'CardioMonitor Pro X1',
          manufacturer: 'MedTech Devices Inc.',
          submissionType: 'Traditional',
          decisionDate: '2023-07-15',
          productCode: productCode || 'DPS',
          deviceClass: deviceClass || 'II',
          matchScore: 0.94,
          regulatoryHistory: {
            recalls: 0,
            adverseEvents: 3
          },
          summaryUrl: 'https://www.fda.gov/database/510k/k123456'
        },
        {
          id: 'K987654',
          deviceName: 'HeartTrack Continuous Monitor',
          manufacturer: 'Cardiac Systems Ltd.',
          submissionType: 'Special',
          decisionDate: '2022-09-30',
          productCode: productCode || 'DPS',
          deviceClass: deviceClass || 'II',
          matchScore: 0.89,
          regulatoryHistory: {
            recalls: 1,
            adverseEvents: 5
          },
          summaryUrl: 'https://www.fda.gov/database/510k/k987654'
        },
        {
          id: 'K456789',
          deviceName: 'CardiaCare ECG System',
          manufacturer: 'BioMedical Solutions',
          submissionType: 'Traditional',
          decisionDate: '2021-11-18',
          productCode: productCode || 'DPS',
          deviceClass: deviceClass || 'II',
          matchScore: 0.82,
          regulatoryHistory: {
            recalls: 0,
            adverseEvents: 2
          },
          summaryUrl: 'https://www.fda.gov/database/510k/k456789'
        }
      ],
      literatureReferences: [
        {
          id: 'PMC7654321',
          title: 'Safety and Efficacy of Continuous ECG Monitoring Devices in Clinical Settings',
          journal: 'Journal of Medical Devices',
          authors: 'Smith J, Johnson M, et al.',
          publicationDate: '2023-03-15',
          doi: '10.1234/jmd.2023.7654321',
          relevanceScore: 0.91
        },
        {
          id: 'PMC1234567',
          title: 'Comparison of ECG Monitoring Technologies for Cardiac Patients',
          journal: 'Cardiovascular Technology Review',
          authors: 'Williams A, Brown B, et al.',
          publicationDate: '2022-08-22',
          doi: '10.5678/ctr.2022.1234567',
          relevanceScore: 0.85
        }
      ],
      metadata: {
        searchTimestamp: new Date().toISOString(),
        totalResults: 5,
        processingTimeMs: 780,
        searchAlgorithm: 'hybrid-semantic-v2',
        confidence: 0.92,
        filters: {
          deviceClass: deviceClass || 'II',
          productCode: productCode || 'DPS'
        }
      }
    };
    
    // Track search history in database if needed
    // This would be implemented in a production environment
    
    res.json(results);
  } catch (error) {
    console.error('Error in predicate search:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/fda510k/regulatory-pathway-analysis
 * Analyze and recommend appropriate regulatory pathway
 */
router.post('/regulatory-pathway-analysis', async (req: Request, res: Response) => {
  try {
    const deviceData = req.body;
    const tenantContext = (req as any).tenantContext;
    
    console.log('510(k) Regulatory pathway analysis request:', {
      deviceName: deviceData.deviceName,
      deviceClass: deviceData.deviceClass,
      tenantContext
    });
    
    // For this MVP implementation we're returning simulated data
    // In a production environment, this would integrate with regulatory decision APIs
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Return simulated pathway analysis
    const deviceClass = deviceData.deviceClass || 'II';
    let results;
    
    if (deviceClass === 'I') {
      results = {
        recommendedPathway: '510(k) Exempt',
        alternativePathways: ['Traditional 510(k)'],
        rationale: 'Based on the device classification and product code, this device appears to be Class I exempt from 510(k) requirements per 21 CFR Part 862-892.',
        estimatedTimelineInDays: 0,
        requirements: [
          'General Controls compliance',
          'Registration and Listing',
          'Good Manufacturing Practices'
        ],
        confidenceScore: 0.95
      };
    } else if (deviceClass === 'II') {
      results = {
        recommendedPathway: 'Traditional 510(k)',
        alternativePathways: ['Special 510(k)', 'Abbreviated 510(k)'],
        rationale: 'Based on the device characteristics and the presence of similar predicate devices, the most appropriate pathway is a Traditional 510(k) submission.',
        estimatedTimelineInDays: 90,
        requirements: [
          'Substantial Equivalence demonstration',
          'Performance testing',
          'Software validation (if applicable)',
          'Biocompatibility assessment',
          'Clinical data (if necessary)'
        ],
        confidenceScore: 0.92
      };
    } else {
      results = {
        recommendedPathway: 'De Novo or PMA',
        alternativePathways: ['Traditional 510(k) with clinical data'],
        rationale: 'Based on the device classification as Class III and the novel technological characteristics, this device likely requires a De Novo request or PMA pathway.',
        estimatedTimelineInDays: 180,
        requirements: [
          'Clinical trial data',
          'Comprehensive risk analysis',
          'Full technical documentation',
          'Manufacturing information',
          'Post-market surveillance plan'
        ],
        confidenceScore: 0.88
      };
    }
    
    // Add additional metadata
    results.timestamp = new Date().toISOString();
    results.processingTimeMs = 1150;
    
    res.json(results);
  } catch (error) {
    console.error('Error in pathway analysis:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/fda510k/submission-requirements
 * Get list of requirements for 510(k) submission
 */
router.get('/submission-requirements', async (req: Request, res: Response) => {
  try {
    const deviceClass = req.query.deviceClass as string || 'II';
    const tenantContext = (req as any).tenantContext;
    
    console.log('510(k) Requirements request:', {
      deviceClass,
      tenantContext
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return requirements based on device class
    const baseRequirements = [
      {
        id: 'req-001',
        name: 'Device Description',
        description: 'Comprehensive description of the device including technology, principles of operation, and physical characteristics',
        required: true,
        deviceClasses: ['I', 'II', 'III'],
        section: 'Device Information'
      },
      {
        id: 'req-002',
        name: 'Intended Use / Indications for Use',
        description: 'Statement of intended use and specific indications for use of the device',
        required: true,
        deviceClasses: ['I', 'II', 'III'],
        section: 'Device Information'
      },
      {
        id: 'req-003',
        name: 'Predicate Device Comparison',
        description: 'Side-by-side comparison with predicate device(s) showing substantial equivalence',
        required: true,
        deviceClasses: ['I', 'II', 'III'],
        section: 'Substantial Equivalence'
      },
      {
        id: 'req-004',
        name: 'Performance Testing - Bench',
        description: 'Results of bench testing to demonstrate substantial equivalence',
        required: true,
        deviceClasses: ['I', 'II', 'III'],
        section: 'Performance Data'
      },
      {
        id: 'req-005',
        name: 'Biocompatibility',
        description: 'Evaluation of biocompatibility for devices that contact the body',
        required: false,
        deviceClasses: ['II', 'III'],
        section: 'Performance Data'
      }
    ];
    
    // Add class-specific requirements
    if (deviceClass === 'II' || deviceClass === 'III') {
      baseRequirements.push({
        id: 'req-006',
        name: 'Sterilization and Shelf Life',
        description: 'Information on sterilization method, validation, and shelf life testing (if applicable)',
        required: false,
        deviceClasses: ['II', 'III'],
        section: 'Performance Data'
      });
      
      baseRequirements.push({
        id: 'req-007',
        name: 'Software Documentation',
        description: 'Documentation of software development, verification, and validation (if applicable)',
        required: false,
        deviceClasses: ['II', 'III'],
        section: 'Performance Data'
      });
    }
    
    if (deviceClass === 'III') {
      baseRequirements.push({
        id: 'req-008',
        name: 'Clinical Performance Data',
        description: 'Clinical studies or literature-based clinical assessment',
        required: true,
        deviceClasses: ['III'],
        section: 'Clinical Evidence'
      });
      
      baseRequirements.push({
        id: 'req-009',
        name: 'Risk Analysis',
        description: 'Comprehensive risk analysis and mitigation strategies',
        required: true,
        deviceClasses: ['III'],
        section: 'Risk Management'
      });
    }
    
    // Filter requirements based on device class
    const filteredRequirements = baseRequirements.filter(req => 
      req.deviceClasses.includes(deviceClass)
    );
    
    res.json(filteredRequirements);
  } catch (error) {
    console.error('Error fetching submission requirements:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/fda510k/generate-draft
 * Generate a 510(k) submission draft
 */
router.post('/generate-draft', async (req: Request, res: Response) => {
  try {
    const { deviceInformation, predicateDevices, generationOptions } = req.body;
    const tenantContext = (req as any).tenantContext;
    
    console.log('510(k) Draft generation request:', {
      deviceName: deviceInformation.deviceName,
      predicateCount: predicateDevices?.length || 0,
      tenantContext
    });
    
    // Simulate processing delay for a complex operation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Return simulated draft generation result
    const result = {
      generationId: `gen-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      documentUrl: `/api/fda510k/drafts/${deviceInformation.id}/latest`,
      sections: [
        {
          name: 'Administrative Information',
          status: 'completed',
          completeness: 1.0
        },
        {
          name: 'Device Description',
          status: 'completed',
          completeness: 0.95
        },
        {
          name: 'Intended Use',
          status: 'completed',
          completeness: 1.0
        },
        {
          name: 'Predicate Device Comparison',
          status: 'completed',
          completeness: 0.92,
          notes: 'Added 3 predicate devices with comparison tables'
        },
        {
          name: 'Technological Characteristics',
          status: 'completed',
          completeness: 0.88
        },
        {
          name: 'Performance Testing',
          status: 'partial',
          completeness: 0.75,
          notes: 'May need additional test data input'
        },
        {
          name: 'Labeling',
          status: 'partial',
          completeness: 0.70
        },
        {
          name: 'Software Documentation',
          status: 'completed',
          completeness: 0.85
        },
        {
          name: 'Biocompatibility',
          status: 'partial',
          completeness: 0.60,
          notes: 'Awaiting biocompatibility test results'
        }
      ],
      metadata: {
        format: generationOptions?.format || 'eSTAR',
        wordCount: 15420,
        pageCount: 47,
        tableCount: 12,
        figureCount: 8,
        generationTimeSeconds: 2.3,
        completenessScore: 0.85
      }
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error generating 510(k) draft:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/fda510k/validate-submission
 * Validate a 510(k) submission for completeness and compliance
 */
router.post('/validate-submission', async (req: Request, res: Response) => {
  try {
    const submissionData = req.body;
    const tenantContext = (req as any).tenantContext;
    
    console.log('510(k) Validation request:', {
      deviceName: submissionData.deviceName,
      tenantContext
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Generate validation results
    const validationResults = {
      isValid: true,
      score: 0.92,
      passedChecks: 28,
      totalChecks: 32,
      criticalIssues: [
        // For demo purposes, we're saying validation passed with no critical issues
      ],
      warnings: [
        {
          id: 'warn-001',
          section: 'Performance Testing',
          description: 'Bench testing data may be insufficient for this device type. Consider adding additional test data.',
          severity: 'medium',
          impact: 'May delay review process',
          recommendation: 'Add additional bench testing data for electrical safety'
        },
        {
          id: 'warn-002',
          section: 'Labeling',
          description: 'Device labeling is missing some recommended warnings',
          severity: 'low',
          impact: 'May require revision during review',
          recommendation: 'Add warnings about potential interference with other electronic devices'
        }
      ],
      suggestions: [
        {
          id: 'sugg-001',
          section: 'Predicate Device Comparison',
          description: 'Consider adding more details to the predicate comparison table',
          impact: 'Would strengthen substantial equivalence argument'
        },
        {
          id: 'sugg-002',
          section: 'Administrative Information',
          description: 'Contact information could be updated for regulatory correspondence',
          impact: 'Would ensure timely communication with FDA'
        },
        {
          id: 'sugg-003',
          section: 'Software Documentation',
          description: 'Software version history could be more detailed',
          impact: 'Would provide better traceability'
        }
      ],
      metadata: {
        validatorVersion: '1.2.0',
        validationTimestamp: new Date().toISOString(),
        regulatoryFrameworks: ['FDA 510(k)', 'eSTAR Format Requirements']
      }
    };
    
    res.json(validationResults);
  } catch (error) {
    console.error('Error validating 510(k) submission:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/fda510k/submission-history
 * Get 510(k) submission history for an organization
 */
router.get('/submission-history', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string;
    const tenantContext = (req as any).tenantContext;
    
    console.log('510(k) Submission history request:', {
      clientId,
      tenantContext
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return simulated submission history
    const submissionHistory = [
      {
        id: 'sub-001',
        deviceName: 'CardioTrack ECG Monitor',
        submissionDate: '2025-03-15T14:30:00Z',
        status: 'submitted',
        trackingNumber: 'K251234',
        pathway: 'Traditional 510(k)',
        decision: 'Pending',
        reviewDays: 45,
        daysRemaining: 45
      },
      {
        id: 'sub-002',
        deviceName: 'GlucoSense Meter Pro',
        submissionDate: '2024-11-20T09:15:00Z',
        status: 'complete',
        trackingNumber: 'K243421',
        pathway: 'Traditional 510(k)',
        decision: 'Substantially Equivalent',
        reviewDays: 87,
        daysRemaining: 0
      },
      {
        id: 'sub-003',
        deviceName: 'ArthroFlex Surgical Instrument',
        submissionDate: '2024-09-05T11:45:00Z',
        status: 'complete',
        trackingNumber: 'K242876',
        pathway: 'Special 510(k)',
        decision: 'Substantially Equivalent',
        reviewDays: 29,
        daysRemaining: 0
      },
      {
        id: 'sub-004',
        deviceName: 'OxyWatch Pulse Oximeter',
        submissionDate: '2024-07-12T10:00:00Z',
        status: 'rta',
        trackingNumber: 'K242211',
        pathway: 'Traditional 510(k)',
        decision: 'Refuse to Accept',
        reviewDays: 15,
        daysRemaining: 0,
        rtaReason: 'Incomplete testing information'
      }
    ];
    
    // Filter by client if requested
    const filteredHistory = clientId 
      ? submissionHistory.filter(sub => sub.id.includes(clientId))
      : submissionHistory;
    
    res.json(filteredHistory);
  } catch (error) {
    console.error('Error fetching submission history:', error);
    res.status(500).json({
      error: error.message,
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;