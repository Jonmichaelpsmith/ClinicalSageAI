/**
 * Analytical Method Routes - Server-side API routes for Analytical Method Repository
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage for analytical methods
let analyticalMethods = [
  {
    id: 'method-1',
    name: 'HPLC Assay for API X',
    code: 'HPLC-001',
    category: 'Assay',
    technique: 'HPLC',
    department: 'Quality Control',
    status: 'Approved',
    version: '1.2',
    versionHistory: [
      {
        version: '1.0',
        date: '2024-12-10',
        author: 'Jane Smith',
        changes: 'Initial method development'
      },
      {
        version: '1.1',
        date: '2025-01-15',
        author: 'John Doe',
        changes: 'Updated mobile phase composition for improved peak resolution'
      },
      {
        version: '1.2',
        date: '2025-03-01',
        author: 'Jane Smith',
        changes: 'Added system suitability criteria per regulatory feedback'
      }
    ],
    procedure: {
      equipment: [
        'HPLC System with UV detector',
        'C18 Column (150 x 4.6 mm, 5 µm)',
        'Analytical Balance'
      ],
      reagents: [
        'Acetonitrile (HPLC grade)',
        'Phosphate Buffer (pH 3.0)',
        'Reference Standard (API X)'
      ],
      mobilePhase: 'Acetonitrile:Buffer (60:40)',
      flowRate: '1.0 mL/min',
      injectionVolume: '10 µL',
      detectionWavelength: '254 nm',
      runTime: '15 minutes',
      samplePreparation: 'Dissolve 50 mg of sample in 50 mL of diluent, sonicate for 10 minutes, and filter',
      systemSuitability: [
        'Resolution between main peak and impurity A > 2.0',
        'RSD of replicate injections < 2.0%',
        'Tailing factor < 1.5'
      ]
    },
    validation: {
      status: 'Complete',
      parameters: {
        specificity: {
          status: 'Pass',
          comments: 'No interference observed at the retention time of API X'
        },
        linearity: {
          status: 'Pass',
          range: '50-150% of nominal concentration',
          r2: 0.9998,
          comments: 'Linear relationship established across the range'
        },
        precision: {
          status: 'Pass',
          intraDay: '0.8% RSD',
          interDay: '1.2% RSD',
          comments: 'Method demonstrates acceptable precision'
        },
        accuracy: {
          status: 'Pass',
          recovery: '98.5-101.2%',
          comments: 'Recovery within acceptance criteria'
        },
        robustness: {
          status: 'Pass',
          comments: 'Method is robust to small changes in flow rate, temperature, and mobile phase composition'
        }
      },
      documents: [
        {
          name: 'Validation Protocol',
          reference: 'VAL-HPLC-001-P'
        },
        {
          name: 'Validation Report',
          reference: 'VAL-HPLC-001-R'
        }
      ]
    },
    sop: {
      number: 'SOP-HPLC-001',
      effectiveDate: '2025-03-15',
      reviewDate: '2026-03-15'
    },
    products: ['Product A', 'Product B'],
    notes: 'Method is stability-indicating and suitable for routine quality control testing',
    createdBy: 'Jane Smith',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2025-03-01T14:30:00Z'
  },
  {
    id: 'method-2',
    name: 'Dissolution Test for Product Y Tablets',
    code: 'DISS-002',
    category: 'Dissolution',
    technique: 'UV Spectroscopy',
    department: 'Quality Control',
    status: 'Approved',
    version: '1.0',
    versionHistory: [
      {
        version: '1.0',
        date: '2025-02-20',
        author: 'John Doe',
        changes: 'Initial method development and validation'
      }
    ],
    procedure: {
      equipment: [
        'Dissolution Apparatus (USP Type II)',
        'UV Spectrophotometer',
        'Analytical Balance'
      ],
      reagents: [
        'Phosphate Buffer (pH 6.8)',
        'Reference Standard (API Y)'
      ],
      medium: 'Phosphate Buffer pH 6.8',
      volume: '900 mL',
      rpm: '50',
      temperature: '37 ± 0.5°C',
      samplingTimes: ['10 min', '20 min', '30 min', '45 min', '60 min'],
      detectionWavelength: '275 nm',
      samplePreparation: 'Filter through 0.45 µm filter, dilute if necessary',
      systemSuitability: [
        'RSD of standard replicates < 2.0%'
      ]
    },
    validation: {
      status: 'Complete',
      parameters: {
        specificity: {
          status: 'Pass',
          comments: 'No interference from excipients or dissolution medium'
        },
        linearity: {
          status: 'Pass',
          range: '10-120% of label claim',
          r2: 0.9995,
          comments: 'Linear relationship established across the range'
        },
        precision: {
          status: 'Pass',
          intraDay: '1.1% RSD',
          interDay: '1.5% RSD',
          comments: 'Method demonstrates acceptable precision'
        },
        accuracy: {
          status: 'Pass',
          recovery: '97.5-102.0%',
          comments: 'Recovery within acceptance criteria'
        },
        robustness: {
          status: 'Pass',
          comments: 'Method is robust to small changes in pH, temperature, and rpm'
        }
      },
      documents: [
        {
          name: 'Validation Protocol',
          reference: 'VAL-DISS-002-P'
        },
        {
          name: 'Validation Report',
          reference: 'VAL-DISS-002-R'
        }
      ]
    },
    sop: {
      number: 'SOP-DISS-002',
      effectiveDate: '2025-02-25',
      reviewDate: '2026-02-25'
    },
    products: ['Product Y'],
    notes: 'Method is suitable for routine quality control and stability testing',
    createdBy: 'John Doe',
    createdAt: '2025-01-15T09:30:00Z',
    updatedAt: '2025-02-20T11:45:00Z'
  },
  {
    id: 'method-3',
    name: 'Karl Fischer Titration for Water Content',
    code: 'KFT-003',
    category: 'Water Content',
    technique: 'Titration',
    department: 'Quality Control',
    status: 'In Development',
    version: '0.2',
    versionHistory: [
      {
        version: '0.1',
        date: '2025-03-10',
        author: 'Sarah Johnson',
        changes: 'Initial method draft'
      },
      {
        version: '0.2',
        date: '2025-04-05',
        author: 'Sarah Johnson',
        changes: 'Updated sample preparation and titration parameters'
      }
    ],
    procedure: {
      equipment: [
        'Karl Fischer Titrator',
        'Analytical Balance',
        'Glass Syringe'
      ],
      reagents: [
        'Karl Fischer Reagent',
        'Methanol (Anhydrous)',
        'Water Standard (1.0 mg/mL)'
      ],
      titrationParameters: {
        endpointDetection: 'Biamperometric',
        stirringSpeed: 'Medium',
        extractionTime: '180 seconds'
      },
      samplePreparation: 'Accurately weigh approximately 500 mg of sample into the titration vessel containing anhydrous methanol',
      systemSuitability: [
        'RSD of standard replicates < 5.0%',
        'Recovery of water standard 98.0-102.0%'
      ]
    },
    validation: {
      status: 'In Progress',
      parameters: {
        specificity: {
          status: 'In Progress',
          comments: 'Preliminary testing suggests good specificity for water content'
        },
        linearity: {
          status: 'Not Started',
          comments: ''
        },
        precision: {
          status: 'Not Started',
          comments: ''
        },
        accuracy: {
          status: 'Not Started',
          comments: ''
        },
        robustness: {
          status: 'Not Started',
          comments: ''
        }
      },
      documents: [
        {
          name: 'Validation Protocol Draft',
          reference: 'VAL-KFT-003-P-DRAFT'
        }
      ]
    },
    sop: {
      number: 'SOP-KFT-003-DRAFT',
      effectiveDate: 'Pending',
      reviewDate: 'Pending'
    },
    products: ['All Products'],
    notes: 'Method is being developed as a general method for water content determination in raw materials and intermediates',
    createdBy: 'Sarah Johnson',
    createdAt: '2025-03-10T13:15:00Z',
    updatedAt: '2025-04-05T10:20:00Z'
  }
];

// Validation checklist template based on ICH Q2(R1)
const validationChecklist = {
  specificity: {
    description: 'Ability to assess unequivocally the analyte in the presence of components that may be expected to be present',
    requirements: [
      'Identification: Demonstrate the method can identify the analyte',
      'Purity Tests: Demonstrate the method can accurately make purity assessments',
      'Assay: Demonstrate that the method can quantify the analyte in the presence of other components'
    ],
    acceptanceCriteria: 'No interference from blank, placebo, impurities, or degradation products at the retention time/response of the analyte',
    documentationNeeded: [
      'Chromatograms/spectra of blank, placebo, standard, sample, and spiked samples',
      'Peak purity data (for chromatographic methods)',
      'Forced degradation results (for stability-indicating methods)'
    ]
  },
  accuracy: {
    description: 'Closeness of test results to the true value',
    requirements: [
      'Minimum of 9 determinations over 3 concentration levels (e.g., 3 replicates of 3 concentrations)',
      'Cover the specified range for the procedure'
    ],
    acceptanceCriteria: '% Recovery within predefined limits (typically 98.0-102.0% for assay, wider for trace analysis)',
    documentationNeeded: [
      'Raw data for all recovery determinations',
      'Calculated % recovery at each level',
      'Statistical analysis (mean, SD, %RSD)'
    ]
  },
  precision: {
    repeatability: {
      description: 'Precision under the same operating conditions over a short interval of time',
      requirements: [
        'Minimum of 6 determinations at 100% of test concentration',
        'Alternatively, 3 replicates at 3 concentration levels'
      ],
      acceptanceCriteria: '%RSD typically ≤ 2.0% for assay, wider for trace analysis',
      documentationNeeded: [
        'Raw data for all replicate determinations',
        'Statistical analysis (mean, SD, %RSD)'
      ]
    },
    intermediateDesign: {
      description: 'Precision within-lab variations (different days, analysts, equipment, etc.)',
      requirements: [
        'Determinations on different days',
        'Different analysts if possible',
        'Different equipment if possible'
      ],
      acceptanceCriteria: '%RSD typically ≤ 3.0% for assay, wider for trace analysis',
      documentationNeeded: [
        'Raw data for all determinations',
        'Details of variation (days, analysts, equipment)',
        'Statistical analysis (mean, SD, %RSD)'
      ]
    },
    reproducibility: {
      description: 'Precision between laboratories (collaborative studies)',
      requirements: [
        'Only needed for method transfer or standardization',
        'Multiple laboratories with defined protocol'
      ],
      acceptanceCriteria: 'Predefined based on method and product specifications',
      documentationNeeded: [
        'Complete protocol and results from all laboratories',
        'Statistical analysis of inter-lab variation'
      ]
    }
  },
  detectionLimit: {
    description: 'Lowest amount of analyte that can be detected',
    requirements: [
      'Based on signal-to-noise ratio (typically 3:1)',
      'Based on standard deviation of response and slope',
      'Based on visual evaluation'
    ],
    acceptanceCriteria: 'Appropriate for intended use of method (typically 0.05-0.1% for related substances)',
    documentationNeeded: [
      'Method used to determine LOD',
      'Chromatograms/spectra at LOD level',
      'Statistical calculations if applicable'
    ]
  },
  quantitationLimit: {
    description: 'Lowest amount of analyte that can be quantitatively determined',
    requirements: [
      'Based on signal-to-noise ratio (typically 10:1)',
      'Based on standard deviation of response and slope',
      'Based on visual evaluation'
    ],
    acceptanceCriteria: 'Appropriate for intended use of method (typically 0.1-0.2% for related substances)',
    documentationNeeded: [
      'Method used to determine LOQ',
      'Chromatograms/spectra at LOQ level',
      'Precision and accuracy data at LOQ level'
    ]
  },
  linearity: {
    description: 'Ability to obtain test results directly proportional to analyte concentration',
    requirements: [
      'Minimum of 5 concentration levels',
      'Cover the specified range of the procedure',
      'Typically 50-150% of test concentration for assay',
      'Typically LOQ to 120% of specification for impurities'
    ],
    acceptanceCriteria: 'Correlation coefficient (r) ≥ 0.99, y-intercept not significantly different from zero',
    documentationNeeded: [
      'Raw data for all concentration levels',
      'Calibration curve',
      'Statistical analysis (correlation coefficient, y-intercept, slope)'
    ]
  },
  range: {
    description: 'Interval between the upper and lower concentration of analyte for which the method has suitable precision, accuracy, and linearity',
    requirements: [
      'Based on purpose of the method:',
      'Assay: Typically 80-120% of test concentration',
      'Content Uniformity: 70-130% of test concentration',
      'Dissolution: ±20% over specified range',
      'Impurities: From LOQ to 120% of specification'
    ],
    acceptanceCriteria: 'Acceptable precision, accuracy, and linearity demonstrated throughout the range',
    documentationNeeded: [
      'Summarized data from precision, accuracy, and linearity studies',
      'Statement of validated range'
    ]
  },
  robustness: {
    description: 'Capacity to remain unaffected by small, deliberate variations in method parameters',
    requirements: [
      'Evaluate stability of analytical solutions',
      'For HPLC methods: Variations in pH, flow rate, column temperature, mobile phase composition',
      'For spectroscopic methods: Variations in pH, reagent concentration, temperature',
      'Different equipment, columns, reagent lots when possible'
    ],
    acceptanceCriteria: 'System suitability criteria met after each variation',
    documentationNeeded: [
      'Description of variations tested',
      'Results showing effect of each variation',
      'Definition of method parameters that require strict control'
    ]
  }
};

/**
 * Get all analytical methods
 * 
 * @route GET /api/analytical/methods
 * @param {string} req.query.category - Filter by category (optional)
 * @param {string} req.query.technique - Filter by technique (optional)
 * @param {string} req.query.status - Filter by status (optional)
 * @param {string} req.query.search - Search keyword (optional)
 * @returns {Object} - List of analytical methods
 */
router.get('/methods', (req, res) => {
  let filtered = [...analyticalMethods];
  
  // Apply filters if provided
  if (req.query.category) {
    filtered = filtered.filter(m => m.category === req.query.category);
  }
  
  if (req.query.technique) {
    filtered = filtered.filter(m => m.technique === req.query.technique);
  }
  
  if (req.query.status) {
    filtered = filtered.filter(m => m.status === req.query.status);
  }
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(search) || 
      m.code.toLowerCase().includes(search) ||
      (m.products && m.products.some(p => p.toLowerCase().includes(search)))
    );
  }
  
  // Return a simplified view without full procedure and validation details
  const simplifiedMethods = filtered.map(m => ({
    id: m.id,
    name: m.name,
    code: m.code,
    category: m.category,
    technique: m.technique,
    department: m.department,
    status: m.status,
    version: m.version,
    products: m.products,
    validation: {
      status: m.validation.status
    },
    sop: {
      number: m.sop.number,
      effectiveDate: m.sop.effectiveDate
    },
    createdAt: m.createdAt,
    updatedAt: m.updatedAt
  }));
  
  res.json({
    success: true,
    methods: simplifiedMethods
  });
});

/**
 * Get an analytical method by ID
 * 
 * @route GET /api/analytical/methods/:methodId
 * @param {string} req.params.methodId - Analytical method ID
 * @returns {Object} - Analytical method data
 */
router.get('/methods/:methodId', (req, res) => {
  const method = analyticalMethods.find(m => m.id === req.params.methodId);
  
  if (!method) {
    return res.status(404).json({
      success: false,
      error: 'Analytical method not found'
    });
  }
  
  res.json({
    success: true,
    method
  });
});

/**
 * Get version history of an analytical method
 * 
 * @route GET /api/analytical/methods/:methodId/versions
 * @param {string} req.params.methodId - Analytical method ID
 * @returns {Object} - Version history
 */
router.get('/methods/:methodId/versions', (req, res) => {
  const method = analyticalMethods.find(m => m.id === req.params.methodId);
  
  if (!method) {
    return res.status(404).json({
      success: false,
      error: 'Analytical method not found'
    });
  }
  
  res.json({
    success: true,
    methodId: method.id,
    methodName: method.name,
    currentVersion: method.version,
    versions: method.versionHistory
  });
});

/**
 * Create a new analytical method
 * 
 * @route POST /api/analytical/methods
 * @param {Object} req.body - Analytical method data
 * @returns {Object} - Created analytical method
 */
router.post('/methods', (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.category || !req.body.technique) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and technique are required fields'
      });
    }
    
    // Create initial version
    const initialVersion = {
      version: '1.0',
      date: new Date().toISOString().split('T')[0],
      author: req.body.createdBy || 'System User',
      changes: 'Initial method creation'
    };
    
    const newMethod = {
      id: `method-${uuidv4()}`,
      ...req.body,
      version: '1.0',
      versionHistory: [initialVersion],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validation: req.body.validation || {
        status: 'Not Started',
        parameters: {}
      },
      sop: req.body.sop || {
        number: '',
        effectiveDate: '',
        reviewDate: ''
      }
    };
    
    analyticalMethods.push(newMethod);
    
    res.status(201).json({
      success: true,
      method: newMethod
    });
  } catch (error) {
    console.error('Error creating analytical method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create analytical method'
    });
  }
});

/**
 * Update an analytical method
 * 
 * @route PUT /api/analytical/methods/:methodId
 * @param {string} req.params.methodId - Analytical method ID
 * @param {Object} req.body - Updated analytical method data
 * @returns {Object} - Updated analytical method
 */
router.put('/methods/:methodId', (req, res) => {
  try {
    const index = analyticalMethods.findIndex(m => m.id === req.params.methodId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Analytical method not found'
      });
    }
    
    // Check if this is a major update that requires a version increment
    const isMajorUpdate = req.body.procedure || 
                          req.body.validation || 
                          req.body.majorUpdate;
    
    let updatedMethod = {
      ...analyticalMethods[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // Increment version if needed
    if (isMajorUpdate) {
      const currentVersion = analyticalMethods[index].version;
      const [major, minor] = currentVersion.split('.').map(Number);
      const newVersion = `${major}.${minor + 1}`;
      
      // Create version history entry
      const versionEntry = {
        version: newVersion,
        date: new Date().toISOString().split('T')[0],
        author: req.body.updatedBy || 'System User',
        changes: req.body.changeDescription || 'Method updated'
      };
      
      updatedMethod = {
        ...updatedMethod,
        version: newVersion,
        versionHistory: [...(updatedMethod.versionHistory || []), versionEntry]
      };
    }
    
    analyticalMethods[index] = updatedMethod;
    
    res.json({
      success: true,
      method: updatedMethod
    });
  } catch (error) {
    console.error('Error updating analytical method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update analytical method'
    });
  }
});

/**
 * Delete an analytical method
 * 
 * @route DELETE /api/analytical/methods/:methodId
 * @param {string} req.params.methodId - Analytical method ID
 * @returns {Object} - Success message
 */
router.delete('/methods/:methodId', (req, res) => {
  try {
    const initialLength = analyticalMethods.length;
    analyticalMethods = analyticalMethods.filter(m => m.id !== req.params.methodId);
    
    if (analyticalMethods.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Analytical method not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Analytical method deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting analytical method:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete analytical method'
    });
  }
});

/**
 * Get validation checklist template
 * 
 * @route GET /api/analytical/validation/checklist
 * @param {string} req.query.category - Validation category (optional)
 * @returns {Object} - Validation checklist template
 */
router.get('/validation/checklist', (req, res) => {
  // If category specified, return just that section
  if (req.query.category && validationChecklist[req.query.category]) {
    return res.json({
      success: true,
      category: req.query.category,
      checklist: {
        [req.query.category]: validationChecklist[req.query.category]
      }
    });
  }
  
  res.json({
    success: true,
    checklist: validationChecklist
  });
});

/**
 * Evaluate method validation against ICH Q2 checklist
 * 
 * @route POST /api/analytical/validation/evaluate
 * @param {Object} req.body - Validation data to evaluate
 * @returns {Object} - Evaluation results
 */
router.post('/validation/evaluate', (req, res) => {
  try {
    const { methodType, validation } = req.body;
    
    if (!methodType || !validation) {
      return res.status(400).json({
        success: false,
        error: 'Method type and validation data are required'
      });
    }
    
    // Determine required validation parameters based on method type
    let requiredParameters = [];
    let optionalParameters = [];
    
    switch (methodType) {
      case 'Identification':
        requiredParameters = ['specificity'];
        optionalParameters = ['robustness'];
        break;
        
      case 'Impurity (Quantitative)':
        requiredParameters = ['specificity', 'accuracy', 'precision', 'linearity', 'range', 'quantitationLimit'];
        optionalParameters = ['robustness', 'detectionLimit'];
        break;
        
      case 'Impurity (Limit Test)':
        requiredParameters = ['specificity', 'detectionLimit'];
        optionalParameters = ['robustness'];
        break;
        
      case 'Assay':
        requiredParameters = ['specificity', 'accuracy', 'precision', 'linearity', 'range'];
        optionalParameters = ['robustness'];
        break;
        
      default:
        requiredParameters = ['specificity', 'accuracy', 'precision', 'linearity', 'range'];
        optionalParameters = ['robustness', 'detectionLimit', 'quantitationLimit'];
    }
    
    // Evaluate each parameter
    const evaluationResults = {};
    const allParameters = [...requiredParameters, ...optionalParameters];
    
    allParameters.forEach(param => {
      const isRequired = requiredParameters.includes(param);
      const paramData = validation[param];
      
      let status = 'Not Applicable';
      let comments = '';
      let recommendations = [];
      
      if (isRequired) {
        if (!paramData) {
          status = 'Missing';
          comments = `${param} is required for this method type but was not provided`;
          recommendations.push(`Perform ${param} validation as per ICH Q2(R1)`);
        } else {
          // Simple check for completeness
          if (paramData.status === 'Pass') {
            status = 'Compliant';
            comments = `${param} validation meets ICH Q2(R1) requirements`;
          } else if (paramData.status === 'In Progress') {
            status = 'In Progress';
            comments = `${param} validation is in progress`;
            recommendations.push(`Complete ${param} validation as per ICH Q2(R1)`);
          } else {
            status = 'Non-Compliant';
            comments = `${param} validation does not meet ICH Q2(R1) requirements`;
            recommendations.push(`Review and update ${param} validation`);
          }
        }
      } else if (paramData) {
        // Optional parameter that was provided
        if (paramData.status === 'Pass') {
          status = 'Compliant';
          comments = `${param} validation meets ICH Q2(R1) requirements`;
        } else if (paramData.status === 'In Progress') {
          status = 'In Progress';
          comments = `${param} validation is in progress`;
        } else {
          status = 'Non-Compliant';
          comments = `${param} validation does not meet ICH Q2(R1) requirements`;
          recommendations.push(`Review and update ${param} validation`);
        }
      }
      
      evaluationResults[param] = {
        required: isRequired,
        status,
        comments,
        recommendations,
        reference: validationChecklist[param] || null
      };
    });
    
    // Calculate overall compliance
    const requiredResults = requiredParameters.map(param => evaluationResults[param]);
    const compliantRequired = requiredResults.filter(r => r.status === 'Compliant').length;
    const compliance = (compliantRequired / requiredParameters.length) * 100;
    
    // Get all unique recommendations
    const allRecommendations = [...new Set(
      Object.values(evaluationResults)
        .flatMap(r => r.recommendations)
    )];
    
    res.json({
      success: true,
      methodType,
      compliance: `${compliance.toFixed(1)}%`,
      evaluationResults,
      summary: {
        requiredParameters,
        optionalParameters,
        compliantRequired,
        totalRequired: requiredParameters.length,
        status: compliance === 100 ? 'Fully Compliant' : 
               compliance >= 50 ? 'Partially Compliant' : 'Non-Compliant'
      },
      recommendations: allRecommendations
    });
  } catch (error) {
    console.error('Error evaluating validation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate validation data'
    });
  }
});

/**
 * Get method categories
 * 
 * @route GET /api/analytical/categories
 * @returns {Object} - List of categories
 */
router.get('/categories', (req, res) => {
  const categories = [...new Set(analyticalMethods.map(m => m.category))];
  
  res.json({
    success: true,
    categories
  });
});

/**
 * Get analytical techniques
 * 
 * @route GET /api/analytical/techniques
 * @returns {Object} - List of techniques
 */
router.get('/techniques', (req, res) => {
  const techniques = [...new Set(analyticalMethods.map(m => m.technique))];
  
  res.json({
    success: true,
    techniques
  });
});

export default router;