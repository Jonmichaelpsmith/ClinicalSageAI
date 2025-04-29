/**
 * Stability Study Routes - Server-side API routes for Stability Study Management
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory storage for stability studies
let stabilityStudies = [
  {
    id: 'study-1',
    name: 'Product X Tablets Long-Term Stability',
    code: 'STAB-PRD-X-01',
    description: 'Long-term stability study for Product X Tablets (10mg)',
    product: {
      name: 'Product X Tablets',
      strength: '10 mg',
      batchNumber: 'BATCH-2025-001',
      manufacturingDate: '2025-01-15',
      expirationDate: '2027-01-31'
    },
    type: 'Long-Term',
    purpose: 'Registration',
    status: 'Active',
    duration: 24, // months
    startDate: '2025-02-01',
    completionDate: '2027-02-01',
    studyDesign: {
      conditions: [
        {
          id: 'condition-1',
          name: 'Long-Term',
          temperature: '25°C',
          humidity: '60% RH',
          orientation: 'Upright',
          packaging: 'HDPE bottle with child-resistant closure',
          lightCondition: 'Protected from light'
        },
        {
          id: 'condition-2',
          name: 'Accelerated',
          temperature: '40°C',
          humidity: '75% RH',
          orientation: 'Upright',
          packaging: 'HDPE bottle with child-resistant closure',
          lightCondition: 'Protected from light'
        }
      ],
      timepoints: [
        {
          id: 'timepoint-1',
          name: 'Initial',
          time: 0,
          unit: 'months'
        },
        {
          id: 'timepoint-2',
          name: '3 Months',
          time: 3,
          unit: 'months'
        },
        {
          id: 'timepoint-3',
          name: '6 Months',
          time: 6,
          unit: 'months'
        },
        {
          id: 'timepoint-4',
          name: '9 Months',
          time: 9,
          unit: 'months'
        },
        {
          id: 'timepoint-5',
          name: '12 Months',
          time: 12,
          unit: 'months'
        },
        {
          id: 'timepoint-6',
          name: '18 Months',
          time: 18,
          unit: 'months'
        },
        {
          id: 'timepoint-7',
          name: '24 Months',
          time: 24,
          unit: 'months'
        }
      ],
      tests: [
        {
          id: 'test-1',
          name: 'Appearance',
          type: 'Visual',
          method: 'Visual Inspection',
          specification: 'White to off-white, round, biconvex tablets',
          units: 'N/A'
        },
        {
          id: 'test-2',
          name: 'Assay',
          type: 'Chemical',
          method: 'HPLC',
          specification: '95.0-105.0% of label claim',
          units: '% LC'
        },
        {
          id: 'test-3',
          name: 'Dissolution',
          type: 'Performance',
          method: 'USP <711>',
          specification: 'NLT 80% (Q) in 30 minutes',
          units: '%'
        },
        {
          id: 'test-4',
          name: 'Related Substances',
          type: 'Impurity',
          method: 'HPLC',
          specification: 'Any individual impurity: NMT 0.2%, Total impurities: NMT 1.0%',
          units: '%'
        },
        {
          id: 'test-5',
          name: 'Water Content',
          type: 'Chemical',
          method: 'Karl Fischer',
          specification: 'NMT 2.0%',
          units: '%'
        }
      ]
    },
    data: {
      // Condition 1 (Long-Term)
      'condition-1': {
        // Timepoint 1 (Initial)
        'timepoint-1': {
          'test-1': { value: 'White, round, biconvex tablets', result: 'Pass', testedDate: '2025-02-05' },
          'test-2': { value: 100.2, result: 'Pass', testedDate: '2025-02-05' },
          'test-3': { value: 95, result: 'Pass', testedDate: '2025-02-06' },
          'test-4': { value: 0.05, result: 'Pass', testedDate: '2025-02-06' },
          'test-5': { value: 0.8, result: 'Pass', testedDate: '2025-02-07' }
        },
        // Timepoint 2 (3 Months)
        'timepoint-2': {
          'test-1': { value: 'White, round, biconvex tablets', result: 'Pass', testedDate: '2025-05-02' },
          'test-2': { value: 99.8, result: 'Pass', testedDate: '2025-05-02' },
          'test-3': { value: 94, result: 'Pass', testedDate: '2025-05-03' },
          'test-4': { value: 0.08, result: 'Pass', testedDate: '2025-05-03' },
          'test-5': { value: 0.9, result: 'Pass', testedDate: '2025-05-04' }
        },
        // Timepoint 3 (6 Months)
        'timepoint-3': {
          'test-1': { value: 'White, round, biconvex tablets', result: 'Pass', testedDate: '2025-08-01' },
          'test-2': { value: 99.1, result: 'Pass', testedDate: '2025-08-01' },
          'test-3': { value: 93, result: 'Pass', testedDate: '2025-08-02' },
          'test-4': { value: 0.12, result: 'Pass', testedDate: '2025-08-02' },
          'test-5': { value: 1.1, result: 'Pass', testedDate: '2025-08-03' }
        }
      },
      // Condition 2 (Accelerated)
      'condition-2': {
        // Timepoint 1 (Initial)
        'timepoint-1': {
          'test-1': { value: 'White, round, biconvex tablets', result: 'Pass', testedDate: '2025-02-05' },
          'test-2': { value: 100.2, result: 'Pass', testedDate: '2025-02-05' },
          'test-3': { value: 95, result: 'Pass', testedDate: '2025-02-06' },
          'test-4': { value: 0.05, result: 'Pass', testedDate: '2025-02-06' },
          'test-5': { value: 0.8, result: 'Pass', testedDate: '2025-02-07' }
        },
        // Timepoint 2 (3 Months)
        'timepoint-2': {
          'test-1': { value: 'White, round, biconvex tablets', result: 'Pass', testedDate: '2025-05-02' },
          'test-2': { value: 98.5, result: 'Pass', testedDate: '2025-05-02' },
          'test-3': { value: 92, result: 'Pass', testedDate: '2025-05-03' },
          'test-4': { value: 0.15, result: 'Pass', testedDate: '2025-05-03' },
          'test-5': { value: 1.2, result: 'Pass', testedDate: '2025-05-04' }
        },
        // Timepoint 3 (6 Months)
        'timepoint-3': {
          'test-1': { value: 'White, round, biconvex tablets', result: 'Pass', testedDate: '2025-08-01' },
          'test-2': { value: 97.3, result: 'Pass', testedDate: '2025-08-01' },
          'test-3': { value: 89, result: 'Pass', testedDate: '2025-08-02' },
          'test-4': { value: 0.25, result: 'Pass', testedDate: '2025-08-02' },
          'test-5': { value: 1.5, result: 'Pass', testedDate: '2025-08-03' }
        }
      }
    },
    protocol: {
      id: 'protocol-1',
      version: '1.0',
      approvalDate: '2025-01-20',
      approvedBy: 'Jane Smith',
      status: 'Approved'
    },
    arrheniusParameters: {
      activationEnergy: 83.2, // kJ/mol
      frequencyFactor: 2.3e9, // 1/s
      referenceTemperature: 25 // °C
    },
    createdBy: 'John Doe',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-08-05T14:30:00Z'
  },
  {
    id: 'study-2',
    name: 'Product Y Cream Stability',
    code: 'STAB-PRD-Y-01',
    description: 'Stability study for Product Y Cream (2%)',
    product: {
      name: 'Product Y Cream',
      strength: '2%',
      batchNumber: 'BATCH-2025-002',
      manufacturingDate: '2025-02-20',
      expirationDate: '2027-02-28'
    },
    type: 'Registration',
    purpose: 'Registration',
    status: 'Active',
    duration: 36, // months
    startDate: '2025-03-01',
    completionDate: '2028-03-01',
    studyDesign: {
      conditions: [
        {
          id: 'condition-1',
          name: 'Long-Term',
          temperature: '25°C',
          humidity: '60% RH',
          orientation: 'Not applicable',
          packaging: 'Aluminum tube with screw cap',
          lightCondition: 'Protected from light'
        },
        {
          id: 'condition-2',
          name: 'Accelerated',
          temperature: '40°C',
          humidity: '75% RH',
          orientation: 'Not applicable',
          packaging: 'Aluminum tube with screw cap',
          lightCondition: 'Protected from light'
        },
        {
          id: 'condition-3',
          name: 'Refrigerated',
          temperature: '5°C',
          humidity: 'Ambient',
          orientation: 'Not applicable',
          packaging: 'Aluminum tube with screw cap',
          lightCondition: 'Protected from light'
        }
      ],
      timepoints: [
        {
          id: 'timepoint-1',
          name: 'Initial',
          time: 0,
          unit: 'months'
        },
        {
          id: 'timepoint-2',
          name: '3 Months',
          time: 3,
          unit: 'months'
        },
        {
          id: 'timepoint-3',
          name: '6 Months',
          time: 6,
          unit: 'months'
        },
        {
          id: 'timepoint-4',
          name: '9 Months',
          time: 9,
          unit: 'months'
        },
        {
          id: 'timepoint-5',
          name: '12 Months',
          time: 12,
          unit: 'months'
        },
        {
          id: 'timepoint-6',
          name: '18 Months',
          time: 18,
          unit: 'months'
        },
        {
          id: 'timepoint-7',
          name: '24 Months',
          time: 24,
          unit: 'months'
        },
        {
          id: 'timepoint-8',
          name: '36 Months',
          time: 36,
          unit: 'months'
        }
      ],
      tests: [
        {
          id: 'test-1',
          name: 'Appearance',
          type: 'Visual',
          method: 'Visual Inspection',
          specification: 'White to off-white cream',
          units: 'N/A'
        },
        {
          id: 'test-2',
          name: 'Assay',
          type: 'Chemical',
          method: 'HPLC',
          specification: '90.0-110.0% of label claim',
          units: '% LC'
        },
        {
          id: 'test-3',
          name: 'pH',
          type: 'Physical',
          method: 'pH meter',
          specification: '5.5-7.5',
          units: 'pH units'
        },
        {
          id: 'test-4',
          name: 'Related Substances',
          type: 'Impurity',
          method: 'HPLC',
          specification: 'Any individual impurity: NMT 0.5%, Total impurities: NMT 2.0%',
          units: '%'
        },
        {
          id: 'test-5',
          name: 'Viscosity',
          type: 'Physical',
          method: 'Brookfield viscometer',
          specification: '15000-25000 cP',
          units: 'cP'
        },
        {
          id: 'test-6',
          name: 'Microbial Limits',
          type: 'Microbiological',
          method: 'USP <61>',
          specification: 'TAMC: NMT 100 CFU/g, TYMC: NMT 10 CFU/g, No pathogens',
          units: 'CFU/g'
        }
      ]
    },
    data: {
      // Only initial data available
      'condition-1': {
        'timepoint-1': {
          'test-1': { value: 'White cream', result: 'Pass', testedDate: '2025-03-05' },
          'test-2': { value: 102.1, result: 'Pass', testedDate: '2025-03-05' },
          'test-3': { value: 6.5, result: 'Pass', testedDate: '2025-03-06' },
          'test-4': { value: 0.1, result: 'Pass', testedDate: '2025-03-06' },
          'test-5': { value: 18500, result: 'Pass', testedDate: '2025-03-07' },
          'test-6': { value: 'TAMC: <10 CFU/g, TYMC: <10 CFU/g, No pathogens', result: 'Pass', testedDate: '2025-03-10' }
        }
      },
      'condition-2': {
        'timepoint-1': {
          'test-1': { value: 'White cream', result: 'Pass', testedDate: '2025-03-05' },
          'test-2': { value: 102.1, result: 'Pass', testedDate: '2025-03-05' },
          'test-3': { value: 6.5, result: 'Pass', testedDate: '2025-03-06' },
          'test-4': { value: 0.1, result: 'Pass', testedDate: '2025-03-06' },
          'test-5': { value: 18500, result: 'Pass', testedDate: '2025-03-07' },
          'test-6': { value: 'TAMC: <10 CFU/g, TYMC: <10 CFU/g, No pathogens', result: 'Pass', testedDate: '2025-03-10' }
        }
      },
      'condition-3': {
        'timepoint-1': {
          'test-1': { value: 'White cream', result: 'Pass', testedDate: '2025-03-05' },
          'test-2': { value: 102.1, result: 'Pass', testedDate: '2025-03-05' },
          'test-3': { value: 6.5, result: 'Pass', testedDate: '2025-03-06' },
          'test-4': { value: 0.1, result: 'Pass', testedDate: '2025-03-06' },
          'test-5': { value: 18500, result: 'Pass', testedDate: '2025-03-07' },
          'test-6': { value: 'TAMC: <10 CFU/g, TYMC: <10 CFU/g, No pathogens', result: 'Pass', testedDate: '2025-03-10' }
        }
      }
    },
    protocol: {
      id: 'protocol-2',
      version: '1.0',
      approvalDate: '2025-02-25',
      approvedBy: 'Robert Johnson',
      status: 'Approved'
    },
    createdBy: 'Jane Smith',
    createdAt: '2025-02-15T11:00:00Z',
    updatedAt: '2025-03-15T09:45:00Z'
  }
];

/**
 * Get all stability studies
 * 
 * @route GET /api/stability/studies
 * @param {string} req.query.status - Filter by status (optional)
 * @param {string} req.query.type - Filter by study type (optional)
 * @param {string} req.query.search - Search keyword (optional)
 * @returns {Object} - List of stability studies
 */
router.get('/studies', (req, res) => {
  let filtered = [...stabilityStudies];
  
  // Apply filters if provided
  if (req.query.status) {
    filtered = filtered.filter(s => s.status === req.query.status);
  }
  
  if (req.query.type) {
    filtered = filtered.filter(s => s.type === req.query.type);
  }
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) || 
      s.code.toLowerCase().includes(search) ||
      s.product.name.toLowerCase().includes(search) ||
      s.product.batchNumber.toLowerCase().includes(search)
    );
  }
  
  // Return a simplified view without full data
  const simplifiedStudies = filtered.map(s => ({
    id: s.id,
    name: s.name,
    code: s.code,
    description: s.description,
    product: s.product,
    type: s.type,
    purpose: s.purpose,
    status: s.status,
    duration: s.duration,
    startDate: s.startDate,
    completionDate: s.completionDate,
    conditions: s.studyDesign.conditions.length,
    timepoints: s.studyDesign.timepoints.length,
    tests: s.studyDesign.tests.length,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt
  }));
  
  res.json({
    success: true,
    studies: simplifiedStudies
  });
});

/**
 * Get a stability study by ID
 * 
 * @route GET /api/stability/studies/:studyId
 * @param {string} req.params.studyId - Stability study ID
 * @returns {Object} - Stability study data
 */
router.get('/studies/:studyId', (req, res) => {
  const study = stabilityStudies.find(s => s.id === req.params.studyId);
  
  if (!study) {
    return res.status(404).json({
      success: false,
      error: 'Stability study not found'
    });
  }
  
  res.json({
    success: true,
    study
  });
});

/**
 * Create a new stability study
 * 
 * @route POST /api/stability/studies
 * @param {Object} req.body - Stability study data
 * @returns {Object} - Created stability study
 */
router.post('/studies', (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.product || !req.body.type) {
      return res.status(400).json({
        success: false,
        error: 'Name, product details, and study type are required'
      });
    }
    
    const newStudy = {
      id: `study-${uuidv4()}`,
      ...req.body,
      status: req.body.status || 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: req.body.data || {},
      studyDesign: req.body.studyDesign || {
        conditions: [],
        timepoints: [],
        tests: []
      }
    };
    
    stabilityStudies.push(newStudy);
    
    res.status(201).json({
      success: true,
      study: newStudy
    });
  } catch (error) {
    console.error('Error creating stability study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stability study'
    });
  }
});

/**
 * Update a stability study
 * 
 * @route PUT /api/stability/studies/:studyId
 * @param {string} req.params.studyId - Stability study ID
 * @param {Object} req.body - Updated stability study data
 * @returns {Object} - Updated stability study
 */
router.put('/studies/:studyId', (req, res) => {
  try {
    const index = stabilityStudies.findIndex(s => s.id === req.params.studyId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    const updatedStudy = {
      ...stabilityStudies[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // Handle nested updates correctly
    if (req.body.studyDesign) {
      updatedStudy.studyDesign = {
        ...stabilityStudies[index].studyDesign,
        ...req.body.studyDesign
      };
    }
    
    if (req.body.product) {
      updatedStudy.product = {
        ...stabilityStudies[index].product,
        ...req.body.product
      };
    }
    
    stabilityStudies[index] = updatedStudy;
    
    res.json({
      success: true,
      study: updatedStudy
    });
  } catch (error) {
    console.error('Error updating stability study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stability study'
    });
  }
});

/**
 * Delete a stability study
 * 
 * @route DELETE /api/stability/studies/:studyId
 * @param {string} req.params.studyId - Stability study ID
 * @returns {Object} - Success message
 */
router.delete('/studies/:studyId', (req, res) => {
  try {
    const initialLength = stabilityStudies.length;
    stabilityStudies = stabilityStudies.filter(s => s.id !== req.params.studyId);
    
    if (stabilityStudies.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Stability study deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stability study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete stability study'
    });
  }
});

/**
 * Add condition to a stability study
 * 
 * @route POST /api/stability/studies/:studyId/conditions
 * @param {string} req.params.studyId - Stability study ID
 * @param {Object} req.body - Condition data
 * @returns {Object} - Updated study design
 */
router.post('/studies/:studyId/conditions', (req, res) => {
  try {
    const index = stabilityStudies.findIndex(s => s.id === req.params.studyId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    // Validate required fields
    if (!req.body.name || !req.body.temperature) {
      return res.status(400).json({
        success: false,
        error: 'Condition name and temperature are required'
      });
    }
    
    const newCondition = {
      id: `condition-${uuidv4()}`,
      ...req.body
    };
    
    stabilityStudies[index].studyDesign.conditions.push(newCondition);
    stabilityStudies[index].updatedAt = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      condition: newCondition,
      studyDesign: stabilityStudies[index].studyDesign
    });
  } catch (error) {
    console.error('Error adding condition:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add condition'
    });
  }
});

/**
 * Add timepoint to a stability study
 * 
 * @route POST /api/stability/studies/:studyId/timepoints
 * @param {string} req.params.studyId - Stability study ID
 * @param {Object} req.body - Timepoint data
 * @returns {Object} - Updated study design
 */
router.post('/studies/:studyId/timepoints', (req, res) => {
  try {
    const index = stabilityStudies.findIndex(s => s.id === req.params.studyId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    // Validate required fields
    if (!req.body.name || req.body.time === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Timepoint name and time are required'
      });
    }
    
    const newTimepoint = {
      id: `timepoint-${uuidv4()}`,
      ...req.body,
      unit: req.body.unit || 'months'
    };
    
    stabilityStudies[index].studyDesign.timepoints.push(newTimepoint);
    stabilityStudies[index].updatedAt = new Date().toISOString();
    
    // Sort timepoints by time
    stabilityStudies[index].studyDesign.timepoints.sort((a, b) => a.time - b.time);
    
    res.status(201).json({
      success: true,
      timepoint: newTimepoint,
      studyDesign: stabilityStudies[index].studyDesign
    });
  } catch (error) {
    console.error('Error adding timepoint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add timepoint'
    });
  }
});

/**
 * Add test to a stability study
 * 
 * @route POST /api/stability/studies/:studyId/tests
 * @param {string} req.params.studyId - Stability study ID
 * @param {Object} req.body - Test data
 * @returns {Object} - Updated study design
 */
router.post('/studies/:studyId/tests', (req, res) => {
  try {
    const index = stabilityStudies.findIndex(s => s.id === req.params.studyId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    // Validate required fields
    if (!req.body.name || !req.body.method) {
      return res.status(400).json({
        success: false,
        error: 'Test name and method are required'
      });
    }
    
    const newTest = {
      id: `test-${uuidv4()}`,
      ...req.body
    };
    
    stabilityStudies[index].studyDesign.tests.push(newTest);
    stabilityStudies[index].updatedAt = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      test: newTest,
      studyDesign: stabilityStudies[index].studyDesign
    });
  } catch (error) {
    console.error('Error adding test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add test'
    });
  }
});

/**
 * Add stability data for a specific condition, timepoint, and test
 * 
 * @route POST /api/stability/studies/:studyId/data
 * @param {string} req.params.studyId - Stability study ID
 * @param {Object} req.body - Stability data
 * @returns {Object} - Updated stability data
 */
router.post('/studies/:studyId/data', (req, res) => {
  try {
    const index = stabilityStudies.findIndex(s => s.id === req.params.studyId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    // Validate required fields
    const { conditionId, timepointId, testId, value, result } = req.body;
    if (!conditionId || !timepointId || !testId || value === undefined || !result) {
      return res.status(400).json({
        success: false,
        error: 'Condition ID, timepoint ID, test ID, value, and result are required'
      });
    }
    
    // Check if condition, timepoint, and test exist
    const conditionExists = stabilityStudies[index].studyDesign.conditions.some(c => c.id === conditionId);
    const timepointExists = stabilityStudies[index].studyDesign.timepoints.some(t => t.id === timepointId);
    const testExists = stabilityStudies[index].studyDesign.tests.some(t => t.id === testId);
    
    if (!conditionExists || !timepointExists || !testExists) {
      return res.status(400).json({
        success: false,
        error: 'Condition, timepoint, or test does not exist in the study design'
      });
    }
    
    // Initialize data structure if needed
    if (!stabilityStudies[index].data) {
      stabilityStudies[index].data = {};
    }
    
    if (!stabilityStudies[index].data[conditionId]) {
      stabilityStudies[index].data[conditionId] = {};
    }
    
    if (!stabilityStudies[index].data[conditionId][timepointId]) {
      stabilityStudies[index].data[conditionId][timepointId] = {};
    }
    
    // Add or update data
    stabilityStudies[index].data[conditionId][timepointId][testId] = {
      value,
      result,
      testedDate: req.body.testedDate || new Date().toISOString().split('T')[0],
      notes: req.body.notes || ''
    };
    
    stabilityStudies[index].updatedAt = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      data: stabilityStudies[index].data[conditionId][timepointId][testId],
      message: 'Stability data added successfully'
    });
  } catch (error) {
    console.error('Error adding stability data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add stability data'
    });
  }
});

/**
 * Get stability data for a specific study
 * 
 * @route GET /api/stability/studies/:studyId/data
 * @param {string} req.params.studyId - Stability study ID
 * @param {string} req.query.conditionId - Filter by condition ID (optional)
 * @param {string} req.query.timepointId - Filter by timepoint ID (optional)
 * @param {string} req.query.testId - Filter by test ID (optional)
 * @returns {Object} - Stability data
 */
router.get('/studies/:studyId/data', (req, res) => {
  try {
    const study = stabilityStudies.find(s => s.id === req.params.studyId);
    
    if (!study) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    const { conditionId, timepointId, testId } = req.query;
    let data = study.data || {};
    
    // Apply filters if provided
    if (conditionId) {
      data = data[conditionId] ? { [conditionId]: data[conditionId] } : {};
      
      if (timepointId) {
        data[conditionId] = data[conditionId] && data[conditionId][timepointId] ? 
          { [timepointId]: data[conditionId][timepointId] } : {};
        
        if (testId) {
          data[conditionId][timepointId] = data[conditionId][timepointId] && data[conditionId][timepointId][testId] ?
            { [testId]: data[conditionId][timepointId][testId] } : {};
        }
      }
    }
    
    res.json({
      success: true,
      studyId: study.id,
      data
    });
  } catch (error) {
    console.error('Error getting stability data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stability data'
    });
  }
});

/**
 * Generate a stability protocol for a study
 * 
 * @route POST /api/stability/studies/:studyId/protocol
 * @param {string} req.params.studyId - Stability study ID
 * @param {Object} req.body - Protocol generation parameters
 * @returns {Object} - Generated protocol
 */
router.post('/studies/:studyId/protocol', (req, res) => {
  try {
    const study = stabilityStudies.find(s => s.id === req.params.studyId);
    
    if (!study) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    // Generate protocol based on study design
    const protocol = {
      id: `protocol-${uuidv4()}`,
      version: '1.0',
      title: `Stability Protocol for ${study.name}`,
      studyId: study.id,
      product: study.product,
      purpose: study.purpose,
      type: study.type,
      duration: study.duration,
      generatedAt: new Date().toISOString(),
      status: 'Draft',
      sections: [
        {
          title: '1. Introduction',
          content: `This stability protocol describes the testing plan for ${study.product.name} (${study.product.strength}) to establish shelf life and storage conditions in accordance with ICH Q1A(R2) guidelines.`
        },
        {
          title: '2. Study Objectives',
          content: `The objective of this stability study is to evaluate the stability of ${study.product.name} and to establish appropriate storage conditions and shelf life.`
        },
        {
          title: '3. Product Description',
          content: `Product Name: ${study.product.name}\nStrength: ${study.product.strength}\nBatch Number: ${study.product.batchNumber}\nManufacturing Date: ${study.product.manufacturingDate}`
        },
        {
          title: '4. Storage Conditions',
          content: study.studyDesign.conditions.map(c => 
            `${c.name}: ${c.temperature}, ${c.humidity || 'Ambient humidity'}, ${c.lightCondition || 'Normal lighting'}, ${c.packaging || 'Standard packaging'}`
          ).join('\n\n')
        },
        {
          title: '5. Testing Schedule',
          content: `Testing will be performed at the following time points: ${study.studyDesign.timepoints.map(t => `${t.name} (${t.time} ${t.unit})`).join(', ')}.`
        },
        {
          title: '6. Test Parameters',
          content: study.studyDesign.tests.map(t => 
            `${t.name}: ${t.method}, Specification: ${t.specification}, Units: ${t.units || 'N/A'}, Type: ${t.type || 'N/A'}`
          ).join('\n\n')
        },
        {
          title: '7. Acceptance Criteria',
          content: 'All test results must meet the product specifications. Any out-of-specification results will be investigated according to SOP-XXX.'
        },
        {
          title: '8. Reporting',
          content: 'A stability report will be prepared at the conclusion of the study, or at predefined intervals as required. Any significant findings will be reported immediately.'
        }
      ],
      approvals: [
        {
          role: 'Study Director',
          name: '',
          signature: '',
          date: ''
        },
        {
          role: 'Quality Assurance',
          name: '',
          signature: '',
          date: ''
        }
      ]
    };
    
    // Store protocol in study
    study.protocol = protocol;
    study.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      protocol
    });
  } catch (error) {
    console.error('Error generating protocol:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate protocol'
    });
  }
});

/**
 * Get stability protocol for a study
 * 
 * @route GET /api/stability/studies/:studyId/protocol
 * @param {string} req.params.studyId - Stability study ID
 * @returns {Object} - Stability protocol
 */
router.get('/studies/:studyId/protocol', (req, res) => {
  try {
    const study = stabilityStudies.find(s => s.id === req.params.studyId);
    
    if (!study) {
      return res.status(404).json({
        success: false,
        error: 'Stability study not found'
      });
    }
    
    if (!study.protocol) {
      return res.status(404).json({
        success: false,
        error: 'Protocol not found for this study'
      });
    }
    
    res.json({
      success: true,
      protocol: study.protocol
    });
  } catch (error) {
    console.error('Error getting protocol:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get protocol'
    });
  }
});

export default router;