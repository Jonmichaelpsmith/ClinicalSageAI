import express from 'express';

const router = express.Router();

/**
 * Get 510(k) submission requirements by device class
 * GET /api/fda510k/requirements/:deviceClass
 */
router.get('/requirements/:deviceClass', (req: express.Request, res: express.Response) => {
  const { deviceClass } = req.params;
  
  try {
    // Sample requirements data for different device classes
    const requirementsMap = {
      'I': {
        requirements: [
          { id: 'req-1-1', name: 'Device Description', required: true, category: 'general' },
          { id: 'req-1-2', name: 'Indications for Use', required: true, category: 'general' },
          { id: 'req-1-3', name: 'Performance Data', required: false, category: 'testing' },
          { id: 'req-1-4', name: 'Labeling', required: true, category: 'documentation' }
        ]
      },
      'II': {
        requirements: [
          { id: 'req-2-1', name: 'Device Description', required: true, category: 'general' },
          { id: 'req-2-2', name: 'Indications for Use', required: true, category: 'general' },
          { id: 'req-2-3', name: 'Substantial Equivalence', required: true, category: 'equivalence' },
          { id: 'req-2-4', name: 'Performance Testing - Bench', required: true, category: 'testing' },
          { id: 'req-2-5', name: 'Biocompatibility', required: true, category: 'testing' },
          { id: 'req-2-6', name: 'Sterilization', required: false, category: 'testing' },
          { id: 'req-2-7', name: 'Software Documentation', required: false, category: 'documentation' },
          { id: 'req-2-8', name: 'Electrical Safety', required: false, category: 'testing' },
          { id: 'req-2-9', name: 'Labeling', required: true, category: 'documentation' },
          { id: 'req-2-10', name: 'Risk Analysis', required: true, category: 'documentation' }
        ]
      },
      'III': {
        requirements: [
          { id: 'req-3-1', name: 'Device Description', required: true, category: 'general' },
          { id: 'req-3-2', name: 'Indications for Use', required: true, category: 'general' },
          { id: 'req-3-3', name: 'Substantial Equivalence', required: true, category: 'equivalence' },
          { id: 'req-3-4', name: 'Performance Testing - Bench', required: true, category: 'testing' },
          { id: 'req-3-5', name: 'Performance Testing - Animal', required: false, category: 'testing' },
          { id: 'req-3-6', name: 'Performance Testing - Clinical', required: false, category: 'testing' },
          { id: 'req-3-7', name: 'Biocompatibility', required: true, category: 'testing' },
          { id: 'req-3-8', name: 'Sterilization', required: true, category: 'testing' },
          { id: 'req-3-9', name: 'Software Documentation', required: false, category: 'documentation' },
          { id: 'req-3-10', name: 'Electrical Safety', required: false, category: 'testing' },
          { id: 'req-3-11', name: 'Labeling', required: true, category: 'documentation' },
          { id: 'req-3-12', name: 'Risk Analysis', required: true, category: 'documentation' },
          { id: 'req-3-13', name: 'Manufacturing Information', required: true, category: 'documentation' }
        ]
      }
    };
    
    // Return requirements for the specified device class
    const requirements = requirementsMap[deviceClass] || { requirements: [] };
    
    res.json(requirements);
  } catch (error) {
    console.error('Error retrieving requirements:', error);
    res.status(500).json({ message: 'Error retrieving requirements' });
  }
});

/**
 * Find predicate devices
 * POST /api/fda510k/find-predicates
 */
router.post('/find-predicates', (req: express.Request, res: express.Response) => {
  const { deviceData, organizationId } = req.body;
  
  try {
    // Generate sample predicate devices based on input data
    const predicateDevices = [
      {
        id: 'pred1',
        deviceName: 'Similar ECG Monitor',
        manufacturer: 'MedTech Inc.',
        k510Number: 'K123456',
        clearanceDate: '2022-08-15',
        productCode: 'DPS',
        matchScore: 0.94,
        matchReason: 'Similar indications for use and technological characteristics'
      },
      {
        id: 'pred2',
        deviceName: 'CardioMonitor Pro',
        manufacturer: 'CardioTech',
        k510Number: 'K789012',
        clearanceDate: '2021-04-22',
        productCode: 'DPS',
        matchScore: 0.89,
        matchReason: 'Same product code and similar functionality'
      },
      {
        id: 'pred3',
        deviceName: 'VitaSense ECG',
        manufacturer: 'VitaSense Medical Devices',
        k510Number: 'K345678',
        clearanceDate: '2023-01-10',
        productCode: 'DPS',
        matchScore: 0.82,
        matchReason: 'Similar device classification and intended use'
      }
    ];
    
    // Generate sample literature references
    const literatureReferences = [
      {
        id: 'lit1',
        title: 'Safety and Efficacy of Continuous ECG Monitoring in Clinical Settings',
        authors: 'Smith J, Johnson R, Williams K',
        journal: 'Journal of Medical Devices',
        year: 2022,
        doi: '10.1234/jmd.2022.12345',
        relevanceScore: 0.95
      },
      {
        id: 'lit2',
        title: 'Performance Evaluation of ECG Monitoring Systems for Adult Patients',
        authors: 'Garcia A, Lee H, Patel S',
        journal: 'Cardiovascular Engineering and Technology',
        year: 2021,
        doi: '10.1234/cet.2021.67890',
        relevanceScore: 0.88
      }
    ];
    
    res.json({
      predicateDevices,
      literatureReferences
    });
  } catch (error) {
    console.error('Error finding predicate devices:', error);
    res.status(500).json({ message: 'Error finding predicate devices' });
  }
});

/**
 * Analyze regulatory pathway
 * POST /api/fda510k/analyze-pathway
 */
router.post('/analyze-pathway', (req: express.Request, res: express.Response) => {
  const { deviceData, organizationId } = req.body;
  
  try {
    // Analyze regulatory pathway based on device data
    const result = {
      recommendedPathway: 'Traditional 510(k)',
      confidenceScore: 0.94,
      alternativePathways: [
        {
          name: 'Abbreviated 510(k)',
          confidenceScore: 0.65,
          rationale: 'May be suitable if conforming to established special controls'
        },
        {
          name: 'Special 510(k)',
          confidenceScore: 0.42,
          rationale: 'Not recommended as this is not a modification to your own device'
        }
      ],
      rationale: 'Based on device classification (Class II) and the need to demonstrate substantial equivalence to predicate devices.',
      estimatedTimelineInDays: 90,
      keyRequirements: [
        'Full device description',
        'Software documentation',
        'Performance data',
        'Substantial equivalence discussion',
        'Clinical data may be leveraged from predicate'
      ]
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing regulatory pathway:', error);
    res.status(500).json({ message: 'Error analyzing regulatory pathway' });
  }
});

/**
 * Get requirement analysis
 * GET /api/fda510k/requirement-analysis/:requirementId/:projectId
 */
router.get('/requirement-analysis/:requirementId/:projectId', (req: express.Request, res: express.Response) => {
  const { requirementId, projectId } = req.params;
  
  try {
    // Generate sample analysis for the specified requirement
    const analysis = {
      requirementId,
      requirementName: 'Substantial Equivalence',
      status: 'partial',
      completionPercentage: 65,
      missingItems: [
        'Comparison of technological characteristics',
        'Discussion of different technological characteristics'
      ],
      recommendations: [
        'Add comparison table for technological characteristics',
        'Include discussion of why different characteristics don\'t raise new questions of safety and effectiveness'
      ],
      aiAnalysis: 'The substantial equivalence section needs additional information about how the different technological characteristics between your device and the predicate don\'t raise new questions of safety and effectiveness. Consider adding a comparison table and specific examples.'
    };
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing requirement:', error);
    res.status(500).json({ message: 'Error analyzing requirement' });
  }
});

export { router };